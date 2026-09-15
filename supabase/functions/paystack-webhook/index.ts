import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.190.0/crypto/crypto.ts";
import { getAllPaystackSecretKeysAsync } from "../_shared/paystack.ts";
import { calculateAuthoritativeCheckoutTotal } from "../_shared/pricing.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { sendRiderPush } from "../_shared/fcm.ts";

interface PaystackEvent {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    metadata?: {
      order_id?: string;
      user_id?: string;
      checkout_details?: any;
      payment_method?: string;
    };
    customer?: {
      email?: string;
      phone?: string;
    };
  };
}

/**
 * Decrement product stock atomically using database-level locking.
 */
async function decrementStock(
  supabase: any,
  items: Array<{ product_id: string; quantity: number; selected_color?: any }>
) {
  if (!items || items.length === 0) return;

  try {
    const formattedItems = items.map((i) => ({
      product_id: i.product_id,
      quantity: Number(i.quantity) || 1,
      selected_color: i.selected_color || null,
    }));

    const { error: rpcErr } = await supabase.rpc("decrement_product_stock", {
      _items: formattedItems,
    });

    if (rpcErr) {
      console.error("Atomic decrement_product_stock RPC error in webhook:", rpcErr);
      for (const item of items) {
        const qty = Number(item.quantity) || 1;
        const productId = item.product_id;
        if (!productId) continue;

        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", productId)
          .single();

        if (product) {
          const newStock = Math.max(0, (Number(product.stock) || 0) - qty);
          await supabase.from("products").update({ stock: newStock }).eq("id", productId);
        }
      }
    } else {
      console.log("Product stock decremented atomically via webhook for", items.length, "items");
    }
  } catch (err) {
    console.error("Error in webhook decrementStock:", err);
  }
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("x-paystack-signature");
    if (!signature) {
      console.log("Missing x-paystack-signature header");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.text();
    const allKeys = await getAllPaystackSecretKeysAsync();

    let isValidSignature = false;
    const encoder = new TextEncoder();

    for (const keyConfig of allKeys) {
      try {
        const key = await crypto.subtle.importKey(
          "raw",
          encoder.encode(keyConfig.secretKey),
          { name: "HMAC", hash: "SHA-512" },
          false,
          ["sign"]
        );

        const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
        const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        if (signature === expectedSignature) {
          isValidSignature = true;
          break;
        }
      } catch (err) {
        console.warn(`Signature check error with key from ${keyConfig.sourceName}:`, err);
      }
    }

    if (!isValidSignature) {
      console.error("Invalid Paystack webhook signature across all configured keys");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const event: PaystackEvent = JSON.parse(body);
    console.log("Paystack webhook event received:", event.event, "Reference:", event.data?.reference);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let rawMetadata: any = event.data?.metadata || {};
    if (typeof rawMetadata === "string") {
      try {
        rawMetadata = JSON.parse(rawMetadata);
      } catch {}
    }

    const orderId = rawMetadata?.order_id || null;
    const checkoutDetails = rawMetadata?.checkout_details || null;
    let userId = rawMetadata?.user_id || null;
    const reference = event.data?.reference;
    const eventAmountPesewas = Number(event.data?.amount);

    switch (event.event) {
      case "charge.success": {
        // Idempotency check: if order is already marked paid with this reference, do nothing
        if (reference) {
          const { data: existing } = await supabase
            .from("orders")
            .select("id, payment_status")
            .eq("payment_reference", reference)
            .maybeSingle();

          if (existing && existing.payment_status === "paid") {
            console.log(`Webhook: Order ${existing.id} already paid for reference ${reference}`);
            break;
          }
        }

        // Case 1: Pre-created Order ID
        if (orderId) {
          const { data: dbOrder } = await supabase
            .from("orders")
            .select("id, total_amount, tracking_code, payment_status")
            .eq("id", orderId)
            .maybeSingle();

          if (!dbOrder) {
            console.error(`Webhook: Order ${orderId} not found in database.`);
            break;
          }

          const expectedPesewas = Math.round(Number(dbOrder.total_amount) * 100);

          // Amount Validation
          if (eventAmountPesewas < expectedPesewas) {
            console.error(`CRITICAL SECURITY ALERT in Webhook: Paid ${eventAmountPesewas} pesewas < required ${expectedPesewas} pesewas for order ${orderId}`);
            await supabase
              .from("orders")
              .update({
                payment_status: "failed",
                notes: `Security Warning: Underpayment detected via Webhook. Paid ${eventAmountPesewas / 100} GHS vs Required ${expectedPesewas / 100} GHS.`,
                updated_at: new Date().toISOString(),
              })
              .eq("id", orderId);
            break;
          }

          const { error } = await supabase
            .from("orders")
            .update({
              status: "confirmed",
              payment_status: "paid",
              payment_reference: reference,
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);

          if (error) {
            console.error("Error updating order status in webhook:", error);
          } else {
            console.log(`Order ${orderId} payment confirmed by webhook`);

            // Decrement stock
            const { data: orderItems } = await supabase
              .from("order_items")
              .select("product_id, quantity, selected_color")
              .eq("order_id", orderId);
            if (orderItems && orderItems.length > 0) {
              await decrementStock(supabase, orderItems);
            }

            // Send rider push notification
            try {
              await sendRiderPush({
                orderId,
                trackingCode: dbOrder?.tracking_code,
                title: "New Delivery Available! 🚴🔔",
                body: "A new paid order is available for pickup and delivery.",
                type: "new_order",
              });
            } catch (pushErr) {
              console.warn("Rider push notification notice:", pushErr);
            }

            // Record earnings and send notification email
            supabase.rpc("record_order_seller_earnings", { _order_id: orderId })
              .then(() => console.log("Seller earnings recorded for order:", orderId))
              .catch((e: any) => console.warn("Seller earnings notice:", e));

            supabase.functions.invoke("send-order-notification", {
              body: { orderId, status: "confirmed" },
              headers: { Authorization: `Bearer ${supabaseServiceKey}` },
            }).catch((e: any) => console.error("Order notification notice:", e));
          }
        } else if (checkoutDetails && checkoutDetails.items && checkoutDetails.items.length > 0) {
          // Case 2: Direct checkout from cart snapshot
          let pricing;
          try {
            pricing = await calculateAuthoritativeCheckoutTotal(supabase, checkoutDetails);
          } catch (calcErr) {
            console.error("Webhook pricing calculation error:", calcErr);
            break;
          }

          const expectedPesewas = Math.round(pricing.totalAmount * 100);

          if (eventAmountPesewas < expectedPesewas) {
            console.error(`SECURITY ALERT in Webhook: Underpayment (${eventAmountPesewas} < ${expectedPesewas})`);
            break;
          }

          // If userId was null, attempt looking up profile by shipping email
          if (!userId && checkoutDetails.shipping_email) {
            const { data: profileRow } = await supabase
              .from("profiles")
              .select("id")
              .eq("email", checkoutDetails.shipping_email)
              .maybeSingle();
            if (profileRow?.id) {
              userId = profileRow.id;
            }
          }

          const paidAmountGhs = eventAmountPesewas / 100;
          const trackingCode = "TRK" + Array.from({ length: 8 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 30)]).join("");

          const insertPayload: Record<string, any> = {
            user_id: userId || null,
            tracking_code: trackingCode,
            total_amount: paidAmountGhs,
            shipping_name: checkoutDetails.shipping_name || event.data.customer?.email || "Customer",
            shipping_email: checkoutDetails.shipping_email || event.data.customer?.email || "customer@example.com",
            shipping_phone: checkoutDetails.shipping_phone || event.data.customer?.phone || "N/A",
            shipping_address: checkoutDetails.shipping_address || "Paystack Checkout",
            shipping_city: checkoutDetails.shipping_city || "Accra",
            shipping_region: checkoutDetails.shipping_region || "Greater Accra",
            shipping_town: checkoutDetails.shipping_town || null,
            delivery_fee: pricing.deliveryFee,
            discount_code: checkoutDetails.discount_code || null,
            discount_amount: pricing.discountAmount,
            payment_method: rawMetadata?.payment_method || "mobile_money",
            payment_reference: reference,
            status: "confirmed",
            payment_status: "paid",
          };

          const { data: newOrder, error: createErr } = await supabase
            .from("orders")
            .insert(insertPayload)
            .select()
            .single();

          if (!createErr && newOrder && pricing.items.length > 0) {
            console.log(`Webhook created new order ${newOrder.id} for reference ${reference}`);

            const itemsToInsert = pricing.items.map((item: any) => ({
              order_id: newOrder.id,
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price,
              selected_color: item.selected_color || null,
              selected_size: item.selected_size || null,
            }));

            await supabase.from("order_items").insert(itemsToInsert);

            if (userId) {
              await supabase.from("cart_items").delete().eq("user_id", userId);
            }

            await decrementStock(supabase, pricing.items);

            // Send rider push notification
            try {
              await sendRiderPush({
                orderId: newOrder.id,
                trackingCode: newOrder.tracking_code,
                title: "New Delivery Available! 🚴🔔",
                body: "A new paid order is available for pickup and delivery.",
                type: "new_order",
              });
            } catch (pushErr) {
              console.warn("Rider push notification notice:", pushErr);
            }

            // Record earnings and send notification email
            supabase.rpc("record_order_seller_earnings", { _order_id: newOrder.id })
              .then(() => console.log("Seller earnings recorded for order:", newOrder.id))
              .catch((e: any) => console.warn("Seller earnings notice:", e));

            supabase.functions.invoke("send-order-notification", {
              body: { orderId: newOrder.id, status: "confirmed" },
              headers: { Authorization: `Bearer ${supabaseServiceKey}` },
            }).catch((e: any) => console.error("Order notification notice:", e));
          } else if (createErr) {
            console.error("Webhook order creation error:", createErr);
          }
        }
        break;
      }

      case "charge.failed": {
        if (orderId) {
          await supabase
            .from("orders")
            .update({
              status: "cancelled",
              payment_status: "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);
        }
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error processing Paystack webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Webhook handling error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
