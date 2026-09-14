import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Base64url helpers ───────────────────────────────────────────────

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

// ─── RSA key import ──────────────────────────────────────────────────

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const cleanPem = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");

  const binaryDer = Uint8Array.from(atob(cleanPem), (c) => c.charCodeAt(0));

  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

// ─── OAuth2 access token (cached per invocation) ─────────────────────

let _cachedToken: { token: string; expiresAt: number } | null = null;

async function getGoogleAccessToken(serviceAccount: any): Promise<string> {
  // Reuse token if it has at least 60s of life left
  if (_cachedToken && Date.now() < _cachedToken.expiresAt - 60_000) {
    return _cachedToken.token;
  }

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

  const tokenRes = await fetch(
    serviceAccount.token_uri || "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    }
  );

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get OAuth token: ${JSON.stringify(tokenData)}`);
  }

  _cachedToken = {
    token: tokenData.access_token,
    expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000,
  };

  return tokenData.access_token;
}

// ─── Resolve Firebase service account from env ───────────────────────

function resolveServiceAccount(): any | null {
  const serviceAccountJson = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
  if (serviceAccountJson) {
    try {
      return JSON.parse(serviceAccountJson);
    } catch (e) {
      console.error("Error parsing FIREBASE_SERVICE_ACCOUNT JSON:", e);
    }
  }

  const clientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL");
  const privateKey = Deno.env.get("FIREBASE_PRIVATE_KEY");
  const projectId = Deno.env.get("FIREBASE_PROJECT_ID") || "trades-point-rider";
  if (clientEmail && privateKey) {
    return {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, "\n"),
      project_id: projectId,
    };
  }

  return null;
}

// ─── Public: send push to all (or targeted) riders ───────────────────

export interface RiderPushOptions {
  title: string;
  body: string;
  orderId?: string;
  trackingCode?: string;
  type?: string;
  targetRiderId?: string;
}

/**
 * Send an FCM v1 push notification directly to rider devices.
 * This queries the rider_push_tokens table and sends via FCM HTTP v1 API
 * WITHOUT invoking a separate edge function — eliminating ~2-3s of overhead.
 */
export async function sendRiderPush(opts: RiderPushOptions): Promise<{ success: boolean; count: number }> {
  const startMs = Date.now();

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 1. Fetch rider push tokens
  let tokenQuery = supabase.from("rider_push_tokens").select("fcm_token");
  if (opts.targetRiderId) {
    tokenQuery = tokenQuery.eq("user_id", opts.targetRiderId);
  }

  const { data: tokenRecords, error: tokenErr } = await tokenQuery;
  if (tokenErr) {
    console.error("FCM inline: Error fetching rider tokens:", tokenErr);
    return { success: false, count: 0 };
  }

  if (!tokenRecords || tokenRecords.length === 0) {
    console.log("FCM inline: No registered rider push tokens.");
    return { success: true, count: 0 };
  }

  const tokens = Array.from(new Set(tokenRecords.map((t: any) => t.fcm_token).filter(Boolean)));
  console.log(`FCM inline: Sending to ${tokens.length} device(s)...`);

  // 2. Resolve service account + get OAuth2 access token
  const serviceAccount = resolveServiceAccount();
  if (!serviceAccount || !serviceAccount.private_key || !serviceAccount.client_email) {
    console.error("FCM inline: No Firebase service account configured.");
    return { success: false, count: 0 };
  }

  const projectId = serviceAccount.project_id || "trades-point-rider";
  const accessToken = await getGoogleAccessToken(serviceAccount);

  // 3. Fire FCM v1 requests in parallel for all tokens
  const title = opts.title || "New Delivery Available! 🚴🔔";
  const body = opts.body || "A new paid order is ready for delivery pickup.";

  const sendPromises = tokens.map(async (token: string) => {
    const v1Payload = {
      message: {
        token,
        notification: { title, body },
        android: {
          priority: "HIGH",
          ttl: "0s",
          direct_boot_ok: true,
          notification: {
            channel_id: "rider_delivery_channel",
            sound: "notification",
            default_vibrate_timings: true,
            notification_priority: "PRIORITY_MAX",
            visibility: "PUBLIC",
          },
        },
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          title,
          body,
          order_id: opts.orderId || "",
          tracking_code: opts.trackingCode || "",
          type: opts.type || "new_order",
          timestamp: new Date().toISOString(),
        },
      },
    };

    try {
      const res = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(v1Payload),
        }
      );
      const resJson = await res.json();
      if (!res.ok) {
        console.error(`FCM inline: Error for token ${token.slice(0, 10)}...:`, resJson);
      }
      return { token: token.slice(0, 10) + "...", ok: res.ok, result: resJson };
    } catch (err) {
      console.error(`FCM inline: Fetch error for token ${token.slice(0, 10)}...:`, err);
      return { token: token.slice(0, 10) + "...", ok: false, error: String(err) };
    }
  });

  const results = await Promise.all(sendPromises);
  const elapsed = Date.now() - startMs;
  console.log(`FCM inline: Completed in ${elapsed}ms. Results:`, JSON.stringify(results));

  return { success: true, count: tokens.length };
}
