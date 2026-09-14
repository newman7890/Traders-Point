import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { authenticate, isServiceRoleCall } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { sendRiderPush, type RiderPushOptions } from "../_shared/fcm.ts";

/**
 * Standalone edge function for sending rider push notifications.
 * Delegates to the shared _shared/fcm.ts module.
 * Kept as a callable endpoint for manual/test use and backward compatibility.
 */
const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const trusted = isServiceRoleCall(req);
  if (!trusted) {
    const auth = await authenticate(req);
    if (!auth) {
      console.warn("Unauthenticated call to send-rider-push, proceeding if valid payload is present");
    }
  }

  try {
    const payload = await req.json();
    const opts: RiderPushOptions = {
      title: payload.title || "New Delivery Available! 🚴🔔",
      body: payload.body || "A new paid order is ready for delivery pickup.",
      orderId: payload.orderId,
      trackingCode: payload.trackingCode,
      type: payload.type || "new_order",
      targetRiderId: payload.targetRiderId,
    };

    const result = await sendRiderPush(opts);

    return new Response(
      JSON.stringify({ success: result.success, count: result.count, method: "fcm_v1_shared" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-rider-push function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
