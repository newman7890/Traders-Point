import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";
import { authenticate, SUPABASE_URL, SERVICE_ROLE_KEY } from "../_shared/auth.ts";
import { getAllPaystackSecretKeysAsync } from "../_shared/paystack.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { checkGlobalRateLimitAsync, getClientIdentifier } from "../_shared/rateLimit.ts";

const RefundSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  reason: z.string().max(500).optional().nullable(),
});

serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const auth = await authenticate(req);
    const userId = auth?.userId || null;
    const clientId = getClientIdentifier(req, userId);

    // Rate limiting: 10 cancellation requests per 5 minutes
    const rateCheck = await checkGlobalRateLimitAsync(adminClient, "process-refund", clientId, {
      maxRequests: 10,
      windowMs: 5 * 60 * 1000,
    });
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many cancellation requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = RefundSchema.safeParse(body);
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request parameters", details: parseResult.error.format() }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { orderId, reason } = parseResult.data;

    // 1. Fetch order details
    const { data: order, error: orderErr } = await adminClient
      .from("orders")
      .select("id, user_id, status, payment_status, payment_reference, payment_method, total_amount, currency, shipping_email")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Authorization check
    let isAdmin = false;
    if (userId) {
      const { data: roleData } = await adminClient
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      isAdmin = !!roleData;
    }

    if (!isAdmin && order.user_id && order.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: You do not have permission to cancel this order" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Status check: cannot cancel if already shipped or delivered
    if (["shipped", "delivered"].includes(order.status)) {
      return new Response(
        JSON.stringify({ error: "This order has already been dispatched/delivered and cannot be cancelled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (["cancelled", "refunded"].includes(order.status)) {
      return new Response(
        JSON.stringify({ error: `This order is already ${order.status}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let paystackRefundResult: any = null;
    let refundInitiated = false;

    // 4. Trigger Paystack automated refund if paid online with reference
    if (order.payment_status === "paid" && order.payment_reference) {
      console.log(`[process-refund] Attempting Paystack refund for order ${order.id} with ref ${order.payment_reference}`);
      const keys = await getAllPaystackSecretKeysAsync(adminClient);

      for (const keyConfig of keys) {
        try {
          const resp = await fetch("https://api.paystack.co/refund", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${keyConfig.secretKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              transaction: order.payment_reference,
              merchant_note: reason || "Cancelled by customer",
              customer_note: `Refund for cancelled order #${order.id.slice(0, 8).toUpperCase()}`,
            }),
          });

          const resData = await resp.json();
          console.log(`[process-refund] Paystack refund response:`, resData);

          if (resData.status === true) {
            paystackRefundResult = resData.data;
            refundInitiated = true;
            break;
          } else {
            console.warn(`[process-refund] Paystack refund failed with key ${keyConfig.sourceName}:`, resData.message);
          }
        } catch (fetchErr) {
          console.error(`[process-refund] Error calling Paystack refund API:`, fetchErr);
        }
      }
    }

    // 5. Update order status and restore inventory
    const { error: cancelErr } = await adminClient.rpc("cancel_customer_order", {
      _order_id: order.id,
      _reason: reason || "Cancelled by customer",
    });

    if (cancelErr) {
      console.error("[process-refund] RPC cancel_customer_order failed:", cancelErr);
      // Fallback direct update
      await adminClient
        .from("orders")
        .update({
          status: "cancelled",
          cancellation_reason: reason || "Cancelled by customer",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);
    }

    // If refund was triggered, update payment_status to 'refunded'
    if (refundInitiated) {
      await adminClient
        .from("orders")
        .update({
          payment_status: "refunded",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        status: "cancelled",
        refundInitiated,
        paystackRefundResult,
        message: refundInitiated
          ? "Order cancelled and Paystack refund has been initiated to your Mobile Money / Card."
          : "Order cancelled successfully.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("[process-refund] Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
