// ============================================================
// Edge Function: process-reminders
// Purpose: Fire due birthday / anniversary reminders.
//   1. Calls the process_due_reminders() RPC (migration 00052),
//      which creates in-app notifications + advances rule dates and
//      returns the (user, title, body) rows it just created.
//   2. Sends an Expo push for each, using the user's stored token.
// Triggered: On a daily schedule (Supabase scheduled function / cron)
//   — or manually for testing. Idempotent per the RPC's 300-day guard,
//   so a double-invocation on the same day is safe.
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

interface DueReminder {
  notified_user_id: string;
  notification_title: string;
  notification_body: string;
  memorial_id: string | null;
}

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  channelId?: string;
  priority?: "default" | "normal" | "high";
}

async function getUserPushToken(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("notification_preferences")
    .eq("id", userId)
    .single();

  const prefs = (data?.notification_preferences ?? {}) as Record<string, unknown>;
  const token = prefs.push_token as string | undefined;
  if (token && (token.startsWith("ExponentPushToken[") || token.startsWith("ExpoPushToken["))) {
    return token;
  }
  return null;
}

async function sendExpoPush(messages: ExpoPushMessage[]): Promise<{ successes: number; failures: number }> {
  if (messages.length === 0) return { successes: 0, failures: 0 };

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
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(batch),
      });
      if (!res.ok) {
        console.error("Expo Push API error:", await res.text());
        failures += batch.length;
        continue;
      }
      const result = await res.json();
      for (const ticket of result.data ?? []) {
        if (ticket.status === "ok") successes++;
        else failures++;
      }
    } catch (err) {
      console.error("Expo Push send error:", err);
      failures += batch.length;
    }
  }
  return { successes, failures };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Fire due reminders — creates in-app notifications + advances dates.
    const { data: due, error } = await supabase.rpc("process_due_reminders");
    if (error) {
      console.error("process_due_reminders RPC error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reminders = (due ?? []) as DueReminder[];

    // 2. Best-effort push for each (in-app notification already landed).
    const messages: ExpoPushMessage[] = [];
    for (const r of reminders) {
      const token = await getUserPushToken(supabase, r.notified_user_id);
      if (!token) continue;
      messages.push({
        to: token,
        title: r.notification_title,
        body: r.notification_body,
        data: { type: "reminder", memorial_id: r.memorial_id },
        sound: "default",
        channelId: "memorial",
        priority: "high",
      });
    }

    const pushResult = await sendExpoPush(messages);

    return new Response(
      JSON.stringify({
        processed: reminders.length,
        pushed: pushResult.successes,
        push_failures: pushResult.failures,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("process-reminders error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
