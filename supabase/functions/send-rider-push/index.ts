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

// Helper to convert base64url string
function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
}

// Convert PKCS8 PEM to CryptoKey
async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const cleanPem = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");

  const binaryDer = Uint8Array.from(atob(cleanPem), (c) => c.charCodeAt(0));

  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );
}

// Get Google OAuth2 access token for FCM v1 API
async function getGoogleAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: serviceAccount.token_uri || "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaimSet = base64UrlEncode(JSON.stringify(claimSet));
  const signatureInput = `${encodedHeader}.${encodedClaimSet}`;

  const privateKey = await importPrivateKey(serviceAccount.private_key);
  const signatureBuffer = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(signatureInput)
  );

  const encodedSignature = arrayBufferToBase64Url(signatureBuffer);
  const jwt = `${signatureInput}.${encodedSignature}`;

  // Exchange JWT for access token
  const tokenRes = await fetch(serviceAccount.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get OAuth token: ${JSON.stringify(tokenData)}`);
  }

  return tokenData.access_token;
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
      console.log("No registered rider push tokens found in rider_push_tokens table.");
      return new Response(
        JSON.stringify({ success: true, deliveredCount: 0, message: "No registered tokens found" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const tokens = Array.from(new Set(tokenRecords.map((t) => t.fcm_token).filter(Boolean)));
    console.log(`Sending background push notification to ${tokens.length} rider device(s)...`);

    const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
    let serviceAccount: any = null;
    if (serviceAccountJson) {
      try {
        serviceAccount = JSON.parse(serviceAccountJson);
      } catch (parseErr) {
        console.error("Error parsing FIREBASE_SERVICE_ACCOUNT JSON:", parseErr);
      }
    }

    // Modern Firebase HTTP v1 API
    if (serviceAccount && serviceAccount.private_key && serviceAccount.client_email) {
      const projectId = serviceAccount.project_id || "trades-point-rider";
      const accessToken = await getGoogleAccessToken(serviceAccount);
      console.log("Successfully generated Google OAuth2 Access Token for FCM v1");

      const deliveryResults = [];
      for (const token of tokens) {
        const v1Payload = {
          message: {
            token: token,
            notification: {
              title: title || "New Delivery Available! 🔔",
              body: body || "A new paid order is ready for delivery pickup.",
            },
            android: {
              priority: "HIGH",
              notification: {
                channel_id: "rider_delivery_channel",
                sound: "notification",
                default_vibrate_timings: true,
                notification_priority: "PRIORITY_MAX",
              },
            },
            data: {
              click_action: "FLUTTER_NOTIFICATION_CLICK",
              order_id: orderId || "",
              tracking_code: trackingCode || "",
              type: type,
              timestamp: new Date().toISOString(),
            },
          },
        };

        const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(v1Payload),
        });

        const resJson = await res.json();
        deliveryResults.push({ token: token.slice(0, 10) + "...", result: resJson });
      }

      console.log("FCM v1 delivery results:", JSON.stringify(deliveryResults));
      return new Response(
        JSON.stringify({ success: true, method: "fcm_v1", count: tokens.length, results: deliveryResults }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fallback: Legacy FCM server key if configured
    const fcmServerKey = Deno.env.get("FIREBASE_SERVER_KEY") || Deno.env.get("FCM_SERVER_KEY");
    if (fcmServerKey) {
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
      return new Response(
        JSON.stringify({ success: true, method: "legacy_fcm", result: fcmResult, count: tokens.length }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.warn("Neither FIREBASE_SERVICE_ACCOUNT nor FIREBASE_SERVER_KEY is set in Supabase Secrets.");
    return new Response(
      JSON.stringify({ success: false, warning: "Missing Firebase credentials in Supabase Secrets" }),
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
