// ============================================================
// Edge Function: send-email
// Purpose: Centralized email delivery for all app features
// Provider: Resend (resend.com) — set RESEND_API_KEY in secrets
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FROM_EMAIL = "ǝterrn <noreply@eterrn.app>";
const APP_URL = "https://eterrn.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Email Templates ──────────────────────────────────────────

type EmailType =
  | "legacy_letter"
  | "appreciation_letter"
  | "invite"
  | "memorial_notification"
  | "tribute_notification"
  | "gift_received"
  | "reminder"
  | "welcome"
  | "password_reset"
  | "subscription_confirmation"
  | "subscription_cancelled"
  | "custom";

interface EmailRequest {
  type: EmailType;
  to: string;
  subject?: string;
  data: Record<string, string>;
}

function getBrandHeader(): string {
  return `
    <div style="text-align:center;padding:24px 0 16px;">
      <span style="font-size:28px;font-weight:700;color:#4A2D7A;font-family:Georgia,serif;">ǝterrn</span>
      <div style="font-size:12px;color:#9ca3af;margin-top:4px;">Honor. Life. Forever.</div>
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />
  `;
}

function getFooter(): string {
  return `
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 16px;" />
    <div style="text-align:center;padding:0 0 24px;">
      <div style="font-size:12px;color:#9ca3af;">
        <a href="${APP_URL}" style="color:#4A2D7A;text-decoration:none;">eterrn.app</a> &mdash;
        Celebrate, Preserve, Remember
      </div>
      <div style="font-size:11px;color:#d1d5db;margin-top:8px;">
        You received this email because of your activity on ǝterrn.
        <br />
        <a href="${APP_URL}/settings/notifications" style="color:#9ca3af;">Manage email preferences</a>
      </div>
    </div>
  `;
}

function wrapHtml(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;margin-top:24px;margin-bottom:24px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        ${getBrandHeader()}
        <div style="padding:0 24px 24px;">
          ${content}
        </div>
        ${getFooter()}
      </div>
    </body>
    </html>
  `;
}

function buildEmail(type: EmailType, data: Record<string, string>): { subject: string; html: string } {
  switch (type) {
    case "legacy_letter":
      return {
        subject: `A Letter From ${data.sender_name ?? "Someone Special"}`,
        html: wrapHtml(`
          <p style="font-size:15px;color:#374151;line-height:1.6;">
            ${data.sender_name ?? "Someone you love"} wrote you a letter through ǝterrn:
          </p>
          <div style="background:#f3f0ff;border-radius:12px;padding:20px;margin:16px 0;border-left:4px solid #4A2D7A;">
            <p style="font-size:14px;color:#4A2D7A;font-style:italic;line-height:1.7;white-space:pre-wrap;">${data.message ?? ""}</p>
          </div>
          <p style="font-size:13px;color:#6b7280;">
            This letter was delivered through <a href="${APP_URL}" style="color:#4A2D7A;">ǝterrn</a>,
            a platform for preserving memories and honoring the people we love.
          </p>
        `),
      };

    case "appreciation_letter":
      return {
        subject: `${data.sender_name ?? "Someone"} appreciates you!`,
        html: wrapHtml(`
          <p style="font-size:15px;color:#374151;line-height:1.6;">
            ${data.sender_name ?? "Someone"} sent you an appreciation letter:
          </p>
          <div style="background:#fef3c7;border-radius:12px;padding:20px;margin:16px 0;">
            <p style="font-size:18px;color:#92400e;font-weight:600;margin-bottom:8px;">${data.subject ?? "You're Appreciated"}</p>
            <p style="font-size:14px;color:#78350f;line-height:1.7;white-space:pre-wrap;">${data.message ?? ""}</p>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="${APP_URL}/appreciation" style="display:inline-block;background:#4A2D7A;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Write Back</a>
          </div>
        `),
      };

    case "invite":
      return {
        subject: `${data.sender_name ?? "A friend"} invited you to ǝterrn`,
        html: wrapHtml(`
          <p style="font-size:15px;color:#374151;line-height:1.6;">
            ${data.sender_name ?? "A friend"} thinks you'd love ǝterrn — a place to celebrate,
            preserve, and remember the people who matter most.
          </p>
          ${data.personal_message ? `<div style="background:#f3f0ff;border-radius:8px;padding:16px;margin:16px 0;"><p style="font-size:14px;color:#4A2D7A;font-style:italic;">"${data.personal_message}"</p></div>` : ""}
          <div style="text-align:center;margin:24px 0;">
            <a href="${APP_URL}/invite/${data.invite_code ?? ""}" style="display:inline-block;background:#7C3AED;color:white;padding:14px 40px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Join ǝterrn</a>
          </div>
        `),
      };

    case "memorial_notification":
      return {
        subject: `New activity on ${data.memorial_name ?? "a memorial"} you follow`,
        html: wrapHtml(`
          <p style="font-size:15px;color:#374151;line-height:1.6;">
            There's new activity on <strong>${data.memorial_name ?? "a memorial"}</strong>:
          </p>
          <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0;">
            <p style="font-size:14px;color:#374151;">${data.activity_description ?? "Someone added a new tribute."}</p>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="${APP_URL}/memorial/${data.memorial_id ?? ""}" style="display:inline-block;background:#4A2D7A;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View Memorial</a>
          </div>
        `),
      };

    case "tribute_notification":
      return {
        subject: `${data.author_name ?? "Someone"} left a tribute`,
        html: wrapHtml(`
          <p style="font-size:15px;color:#374151;line-height:1.6;">
            <strong>${data.author_name ?? "Someone"}</strong> left a tribute on
            <strong>${data.memorial_name ?? "a memorial"}</strong>:
          </p>
          <div style="background:#f3f0ff;border-radius:8px;padding:16px;margin:16px 0;border-left:3px solid #7C3AED;">
            <p style="font-size:14px;color:#4A2D7A;line-height:1.6;">"${(data.tribute_preview ?? "").slice(0, 200)}"</p>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="${APP_URL}/memorial/${data.memorial_id ?? ""}/wall" style="display:inline-block;background:#4A2D7A;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Read Full Tribute</a>
          </div>
        `),
      };

    case "gift_received":
      return {
        subject: `${data.sender_name ?? "Someone"} sent you ${data.gift_name ?? "a gift"}!`,
        html: wrapHtml(`
          <div style="text-align:center;margin:16px 0;">
            <span style="font-size:48px;">${data.gift_emoji ?? "🌸"}</span>
          </div>
          <p style="font-size:15px;color:#374151;line-height:1.6;text-align:center;">
            <strong>${data.sender_name ?? "Someone"}</strong> sent you
            <strong>${data.gift_name ?? "a gift"}</strong>!
          </p>
          ${data.message ? `<div style="background:#fef3c7;border-radius:8px;padding:16px;margin:16px 0;text-align:center;"><p style="font-size:14px;color:#78350f;font-style:italic;">"${data.message}"</p></div>` : ""}
          <div style="text-align:center;margin:24px 0;">
            <a href="${APP_URL}/gifts" style="display:inline-block;background:#EC4899;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">View Gift</a>
          </div>
        `),
      };

    case "reminder":
      return {
        subject: data.title ?? "ǝterrn Reminder",
        html: wrapHtml(`
          <div style="text-align:center;margin:16px 0;">
            <span style="font-size:40px;">🕯️</span>
          </div>
          <p style="font-size:16px;color:#374151;line-height:1.6;text-align:center;font-weight:600;">
            ${data.title ?? "Reminder"}
          </p>
          ${data.description ? `<p style="font-size:14px;color:#6b7280;text-align:center;">${data.description}</p>` : ""}
          <div style="text-align:center;margin:24px 0;">
            <a href="${APP_URL}/${data.link ?? "reminders"}" style="display:inline-block;background:#4A2D7A;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Open in ǝterrn</a>
          </div>
        `),
      };

    case "welcome":
      return {
        subject: "Welcome to ǝterrn",
        html: wrapHtml(`
          <p style="font-size:16px;color:#374151;line-height:1.6;">
            Welcome to <strong>ǝterrn</strong>, ${data.name ?? "there"}!
          </p>
          <p style="font-size:14px;color:#6b7280;line-height:1.6;">
            ǝterrn is where memories live forever. Whether you're celebrating a life,
            preserving precious moments, or honoring someone you love — you're in the right place.
          </p>
          <div style="background:#f3f0ff;border-radius:12px;padding:20px;margin:20px 0;">
            <p style="font-size:14px;color:#4A2D7A;font-weight:600;margin-bottom:8px;">Get started:</p>
            <ul style="font-size:13px;color:#4A2D7A;line-height:2;">
              <li>Create your first memorial or living tribute</li>
              <li>Capture turning points and build The Arc</li>
              <li>Invite family to collaborate and share memories</li>
              <li>Explore the community and connect with others</li>
            </ul>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="${APP_URL}" style="display:inline-block;background:#7C3AED;color:white;padding:14px 40px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Open ǝterrn</a>
          </div>
        `),
      };

    case "subscription_confirmation":
      return {
        subject: `Welcome to ǝterrn ${data.plan_name ?? "Premium"}!`,
        html: wrapHtml(`
          <div style="text-align:center;margin:16px 0;">
            <span style="font-size:48px;">${data.plan_name === "Elite" ? "💎" : "⭐"}</span>
          </div>
          <p style="font-size:16px;color:#374151;line-height:1.6;text-align:center;">
            You're now a <strong>ǝterrn ${data.plan_name ?? "Premium"}</strong> member!
          </p>
          <div style="background:#f3f0ff;border-radius:12px;padding:20px;margin:20px 0;">
            <p style="font-size:14px;color:#4A2D7A;">Your plan includes:</p>
            <p style="font-size:13px;color:#6b7280;line-height:1.8;">${data.features ?? "All premium features"}</p>
          </div>
          <div style="text-align:center;">
            <a href="${APP_URL}/billing" style="display:inline-block;background:#4A2D7A;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Manage Subscription</a>
          </div>
        `),
      };

    case "subscription_cancelled":
      return {
        subject: "Your ǝterrn subscription has been cancelled",
        html: wrapHtml(`
          <p style="font-size:15px;color:#374151;line-height:1.6;">
            Your ǝterrn ${data.plan_name ?? "Premium"} subscription has been cancelled.
            You'll continue to have access until <strong>${data.end_date ?? "the end of your billing period"}</strong>.
          </p>
          <p style="font-size:14px;color:#6b7280;line-height:1.6;">
            We're sorry to see you go. If you change your mind, you can resubscribe anytime.
          </p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${APP_URL}/billing" style="display:inline-block;background:#7C3AED;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Resubscribe</a>
          </div>
        `),
      };

    case "password_reset":
      return {
        subject: "Reset Your ǝterrn Password",
        html: wrapHtml(`
          <p style="font-size:15px;color:#374151;line-height:1.6;">
            We received a request to reset the password for your ǝterrn account.
          </p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${data.reset_url ?? `${APP_URL}/reset-password`}" style="display:inline-block;background:#7C3AED;color:white;padding:14px 40px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Reset Password</a>
          </div>
          <p style="font-size:13px;color:#6b7280;line-height:1.6;">
            If you didn't request this, you can safely ignore this email. Your password will not change.
          </p>
          <p style="font-size:12px;color:#9ca3af;">This link expires in 1 hour.</p>
        `),
      };

    case "custom":
    default:
      return {
        subject: data.subject ?? "Message from ǝterrn",
        html: wrapHtml(`
          <p style="font-size:15px;color:#374151;line-height:1.6;">${data.message ?? ""}</p>
          ${data.cta_url ? `<div style="text-align:center;margin:24px 0;"><a href="${data.cta_url}" style="display:inline-block;background:#4A2D7A;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">${data.cta_label ?? "View"}</a></div>` : ""}
        `),
      };
  }
}

// ── Main Handler ─────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth check — require a valid user or service-role ──
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: EmailRequest | EmailRequest[] = await req.json();
    const emails = Array.isArray(body) ? body : [body];

    const results = [];

    for (const email of emails) {
      const { type, to, data } = email;

      if (!to || !type) {
        results.push({ to, success: false, error: "Missing 'to' or 'type'" });
        continue;
      }

      const { subject, html } = buildEmail(type, data);
      const finalSubject = email.subject ?? subject;

      // Send via Resend
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject: finalSubject,
          html,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`Email to ${to} failed:`, err);
        results.push({ to, success: false, error: err, subject: finalSubject });
      } else {
        const resData = await res.json();
        results.push({ to, success: true, id: resData.id, subject: finalSubject });
      }
    }

    // Log to email_log table if it exists
    try {
      const supabaseLog = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      for (const result of results) {
        await supabaseLog.from("email_log").insert({
          recipient: result.to,
          email_type: emails.find((e) => e.to === result.to)?.type ?? "unknown",
          subject: (result as any).subject ?? "Unknown",
          status: result.success ? "sent" : "failed",
        }).single();
      }
    } catch {
      // email_log table might not exist — that's fine
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Send email error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
