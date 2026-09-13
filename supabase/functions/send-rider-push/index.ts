import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { authenticate, hasRole, isServiceRoleCall } from "../_shared/auth.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

interface PushPayload {
  title: string;
  body: string;
  orderId?: string;
  trackingCode?: string;
  type?: "new_order" | "order_assigned" | "order_cancelled" | "general";
  targetRiderId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const trusted = isServiceRoleCall(req);
  if (!trusted) {
    const auth = await authenticate(req);
    if (!auth || !(await hasRole(auth.userId, "admin"))) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }

  try {
    const payload: PushPayload = await req.json();
    const { title, body, orderId, trackingCode, type = "new_order", targetRiderId } = payload;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch recipient rider push tokens
    let tokenQuery = supabase.from("rider_push_tokens").select("user_id, fcm_token");

    if (targetRiderId) {
      tokenQuery = tokenQuery.eq("user_id", targetRiderId);
    }

    const { data: tokenRecords, error: tokenErr } = await tokenQuery;

    if (tokenErr) {
      console.error("Error fetching rider push tokens:", tokenErr);
      throw tokenErr;
    }

    if (!tokenRecords || tokenRecords.length === 0) {
      console.log("No registered rider push tokens found.");
      return new Response(
        JSON.stringify({ success: true, deliveredCount: 0, message: "No registered tokens found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const tokens = tokenRecords.map((t) => t.fcm_token).filter(Boolean);
    console.log(`Sending background push notification to ${tokens.length} rider device(s)...`);

    const fcmServerKey = Deno.env.get("FIREBASE_SERVER_KEY") || Deno.env.get("FCM_SERVER_KEY");

    if (!fcmServerKey) {
      console.warn("FIREBASE_SERVER_KEY is not set in Supabase Secrets. Push skipped.");
      return new Response(
        JSON.stringify({ 
          success: false, 
          warning: "FIREBASE_SERVER_KEY secret not configured on Supabase.",
          tokenCount: tokens.length 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 2. Dispatch FCM HTTP multicast payload
    const fcmPayload = {
      registration_ids: tokens,
      priority: "high",
      content_available: true,
      notification: {
        title: title || "New Delivery Available! 🔔",
        body: body || "A new paid order is ready for delivery pickup.",
        sound: "notification.wav",
        android_channel_id: "rider_delivery_channel",
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
        order_id: orderId || "",
        tracking_code: trackingCode || "",
        type: type,
        timestamp: new Date().toISOString(),
      },
    };

    const fcmResponse = await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${fcmServerKey}`,
      },
      body: JSON.stringify(fcmPayload),
    });

    const fcmResult = await fcmResponse.json();
    console.log("FCM push delivery result:", JSON.stringify(fcmResult));

    return new Response(
      JSON.stringify({ success: true, result: fcmResult, recipientsCount: tokens.length }),
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
