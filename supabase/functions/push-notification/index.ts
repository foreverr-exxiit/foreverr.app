// ============================================================
// Edge Function: push-notification
// Purpose: Deliver push notifications via Expo Push API
// Triggered: By DB notification inserts or direct invocation
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushRequest {
  // Send to a specific user
  user_id?: string;
  // Or send to multiple users
  user_ids?: string[];
  // Or provide a notification ID to look up from DB
  notification_id?: string;
  // Direct payload (optional — overrides DB lookup)
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
  channelId?: string;
  priority?: "default" | "normal" | "high";
}

/**
 * Look up a user's Expo push token from their profile.
 * Tokens are stored in notification_preferences.push_token
 */
async function getUserPushToken(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("notification_preferences")
    .eq("id", userId)
    .single();

  if (!data?.notification_preferences) return null;

  const prefs = data.notification_preferences as Record<string, unknown>;
  const token = prefs.push_token as string | undefined;

  // Expo push tokens start with "ExponentPushToken[" or "ExpoPushToken["
  if (token && (token.startsWith("ExponentPushToken[") || token.startsWith("ExpoPushToken["))) {
    return token;
  }

  return null;
}

/**
 * Get the appropriate Android notification channel based on notification type
 */
function getChannelId(type: string): string {
  switch (type) {
    case "tribute":
    case "memorial":
    case "milestone":
      return "memorial";
    case "follow":
    case "mention":
    case "badge":
      return "social";
    default:
      return "default";
  }
}

/**
 * Get unread notification count for badge number
 */
async function getUnreadCount(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  return count ?? 0;
}

/**
 * Send push notifications via Expo Push API
 */
async function sendExpoPush(messages: ExpoPushMessage[]): Promise<{ successes: number; failures: number }> {
  if (messages.length === 0) return { successes: 0, failures: 0 };

  // Expo accepts batches of up to 100
  const batches: ExpoPushMessage[][] = [];
  for (let i = 0; i < messages.length; i += 100) {
    batches.push(messages.slice(i, i + 100));
  }

  let successes = 0;
  let failures = 0;

  for (const batch of batches) {
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(batch),
      });

      if (!res.ok) {
        console.error("Expo Push API error:", await res.text());
        failures += batch.length;
        continue;
      }

      const result = await res.json();
      const tickets = result.data ?? [];

      for (const ticket of tickets) {
        if (ticket.status === "ok") {
          successes++;
        } else {
          failures++;
          if (ticket.details?.error === "DeviceNotRegistered") {
            console.warn("Device not registered, token should be cleaned up");
          }
        }
      }
    } catch (err) {
      console.error("Expo Push send error:", err);
      failures += batch.length;
    }
  }

  return { successes, failures };
}

// ── Main Handler ─────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body: PushRequest = await req.json();

    let title = body.title ?? "";
    let messageBody = body.body ?? "";
    let data: Record<string, unknown> = body.data ?? {};
    let targetUserIds: string[] = [];
    let notificationType = "generic";

    // ── Mode 1: Look up notification from DB ──
    if (body.notification_id) {
      const { data: notification, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("id", body.notification_id)
        .single();

      if (error || !notification) {
        return new Response(
          JSON.stringify({ error: "Notification not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      title = notification.title;
      messageBody = notification.body;
      data = (notification.data as Record<string, unknown>) ?? {};
      notificationType = notification.type ?? "generic";
      targetUserIds = [notification.user_id];
    }
    // ── Mode 2: Direct user_id(s) with payload ──
    else if (body.user_id || body.user_ids) {
      targetUserIds = body.user_ids ?? (body.user_id ? [body.user_id] : []);
      notificationType = (data.type as string) ?? "generic";
    } else {
      return new Response(
        JSON.stringify({ error: "Provide notification_id, user_id, or user_ids" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!title || !messageBody) {
      return new Response(
        JSON.stringify({ error: "title and body are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build push messages for each user
    const messages: ExpoPushMessage[] = [];
    const tokenlessUsers: string[] = [];

    for (const userId of targetUserIds) {
      const token = await getUserPushToken(supabase, userId);
      if (!token) {
        tokenlessUsers.push(userId);
        continue;
      }

      const badgeCount = await getUnreadCount(supabase, userId);

      messages.push({
        to: token,
        title,
        body: messageBody,
        data,
        sound: "default",
        badge: badgeCount,
        channelId: getChannelId(notificationType),
        priority: "high",
      });
    }

    // Send via Expo Push API
    const { successes, failures } = await sendExpoPush(messages);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successes,
        failed: failures,
        no_token: tokenlessUsers.length,
        total_targets: targetUserIds.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Push notification error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
