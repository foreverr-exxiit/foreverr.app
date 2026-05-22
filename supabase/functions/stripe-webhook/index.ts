// ============================================================
// Edge Function: stripe-webhook
// Purpose: Handle Stripe webhook events for donations & gifts
// Provider: Stripe — set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in secrets
// ============================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Stripe Signature Verification ────────────────────────────

async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const parts = signature.split(",").reduce(
      (acc, part) => {
        const [key, value] = part.split("=");
        if (key === "t") acc.timestamp = value;
        if (key === "v1") acc.signatures.push(value);
        return acc;
      },
      { timestamp: "", signatures: [] as string[] }
    );

    if (!parts.timestamp || parts.signatures.length === 0) return false;

    // Check timestamp tolerance (5 minutes)
    const tolerance = 300;
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(parts.timestamp)) > tolerance) return false;

    // Compute expected signature
    const signedPayload = `${parts.timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return parts.signatures.some((sig) => sig === expectedSignature);
  } catch {
    return false;
  }
}

// ── Event Handlers ───────────────────────────────────────────

async function handlePaymentIntentSucceeded(
  supabase: ReturnType<typeof createClient>,
  event: Record<string, unknown>
) {
  const paymentIntent = event.data as Record<string, unknown>;
  const obj = paymentIntent.object as Record<string, unknown>;
  const paymentIntentId = obj.id as string;
  const metadata = (obj.metadata ?? {}) as Record<string, string>;
  const amountReceived = obj.amount_received as number;

  // ── Donation Payment ──
  if (metadata.type === "donation" && metadata.campaign_id) {
    await supabase
      .from("donations")
      .update({ status: "completed" })
      .eq("stripe_payment_intent_id", paymentIntentId);

    console.log(`Donation completed: ${paymentIntentId}, amount: ${amountReceived}`);
  }

  // ── Gift Payment ──
  if (metadata.type === "gift" && metadata.gift_transaction_id) {
    await supabase
      .from("gift_transactions")
      .update({ payment_status: "completed" })
      .eq("payment_intent_id", paymentIntentId);

    console.log(`Gift payment completed: ${paymentIntentId}`);
  }
}

async function handlePaymentIntentFailed(
  supabase: ReturnType<typeof createClient>,
  event: Record<string, unknown>
) {
  const paymentIntent = event.data as Record<string, unknown>;
  const obj = paymentIntent.object as Record<string, unknown>;
  const paymentIntentId = obj.id as string;
  const metadata = (obj.metadata ?? {}) as Record<string, string>;

  if (metadata.type === "donation") {
    await supabase
      .from("donations")
      .update({ status: "failed" })
      .eq("stripe_payment_intent_id", paymentIntentId);
  }

  if (metadata.type === "gift") {
    await supabase
      .from("gift_transactions")
      .update({ payment_status: "failed" })
      .eq("payment_intent_id", paymentIntentId);
  }

  console.log(`Payment failed: ${paymentIntentId}`);
}

async function handleChargeRefunded(
  supabase: ReturnType<typeof createClient>,
  event: Record<string, unknown>
) {
  const charge = event.data as Record<string, unknown>;
  const obj = charge.object as Record<string, unknown>;
  const paymentIntentId = obj.payment_intent as string;

  if (!paymentIntentId) return;

  // Update donation status
  await supabase
    .from("donations")
    .update({ status: "refunded" })
    .eq("stripe_payment_intent_id", paymentIntentId);

  // Update gift transaction status
  await supabase
    .from("gift_transactions")
    .update({ payment_status: "refunded" })
    .eq("payment_intent_id", paymentIntentId);

  console.log(`Refund processed for: ${paymentIntentId}`);
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createClient>,
  event: Record<string, unknown>
) {
  const subscription = event.data as Record<string, unknown>;
  const obj = subscription.object as Record<string, unknown>;
  const stripeSubId = obj.id as string;
  const status = obj.status as string;
  const currentPeriodEnd = obj.current_period_end as number;
  const cancelAtPeriodEnd = obj.cancel_at_period_end as boolean;

  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    active: "active",
    trialing: "trialing",
    past_due: "past_due",
    canceled: "cancelled",
    unpaid: "past_due",
    incomplete: "past_due",
    incomplete_expired: "expired",
    paused: "paused",
  };

  const mappedStatus = statusMap[status] ?? "active";

  const updateData: Record<string, unknown> = {
    status: mappedStatus,
    cancel_at_period_end: cancelAtPeriodEnd ?? false,
    current_period_end: currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  if (status === "canceled") {
    updateData.cancelled_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("user_subscriptions")
    .update(updateData)
    .eq("provider_subscription_id", stripeSubId);

  if (error) {
    console.error("Failed to update subscription:", error);
  } else {
    console.log(`Subscription updated: ${stripeSubId} -> ${mappedStatus}`);
  }
}

async function handleInvoicePaid(
  supabase: ReturnType<typeof createClient>,
  event: Record<string, unknown>
) {
  const invoice = event.data as Record<string, unknown>;
  const obj = invoice.object as Record<string, unknown>;
  const customerId = obj.customer as string;
  const amountPaid = obj.amount_paid as number;
  const currency = (obj.currency as string)?.toUpperCase() ?? "USD";
  const invoiceUrl = obj.hosted_invoice_url as string;
  const receiptUrl = (obj.charge as Record<string, unknown>)?.receipt_url as string | undefined;

  // Find the user by Stripe customer ID
  const { data: subscription } = await supabase
    .from("user_subscriptions")
    .select("id, user_id")
    .eq("provider_customer_id", customerId)
    .single();

  if (!subscription) {
    console.warn("No subscription found for customer:", customerId);
    return;
  }

  // Record billing history
  await supabase.from("billing_history").insert({
    user_id: subscription.user_id,
    subscription_id: subscription.id,
    amount_cents: amountPaid,
    currency,
    description: "Subscription payment",
    status: "completed",
    provider: "stripe",
    provider_payment_id: obj.payment_intent as string,
    invoice_url: invoiceUrl ?? null,
    receipt_url: receiptUrl ?? null,
  });

  console.log(`Invoice paid: ${amountPaid} ${currency} for user ${subscription.user_id}`);
}

// ── Main Handler ─────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      return new Response(
        JSON.stringify({ error: "Stripe keys not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify webhook signature
    const isValid = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const event = JSON.parse(body);
    const eventType = event.type as string;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`Stripe webhook received: ${eventType}`);

    switch (eventType) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(supabase, event);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(supabase, event);
        break;

      case "charge.refunded":
        await handleChargeRefunded(supabase, event);
        break;

      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionUpdated(supabase, event);
        break;

      case "invoice.paid":
        await handleInvoicePaid(supabase, event);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response(
      JSON.stringify({ received: true, type: eventType }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Stripe webhook error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
