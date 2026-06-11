// Stripe webhook handler — keeps orders, subscribers, and payments in sync
// with Stripe events. Public endpoint: secured via Stripe signature verification.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const log = (step: string, details?: unknown) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    log("Missing required secrets");
    return new Response("Server misconfigured", { status: 500, headers: corsHeaders });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing signature", { status: 400, headers: corsHeaders });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    log("Signature verification failed", { error: (err as Error).message });
    return new Response("Invalid signature", { status: 400, headers: corsHeaders });
  }

  log("Event received", { type: event.type, id: event.id });

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // One-time payment: mark the matching order paid.
        if (session.id) {
          const { error } = await admin
            .from("orders")
            .update({
              status: "paid",
              stripe_payment_intent_id:
                typeof session.payment_intent === "string" ? session.payment_intent : null,
              payment_method: "stripe",
              updated_at: new Date().toISOString(),
            })
            .eq("stripe_session_id", session.id);
          if (error) log("orders update error", error);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId =
          typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
        if (!customerId) break;

        // Resolve email from Stripe customer to upsert subscribers.
        const customer = await stripe.customers.retrieve(customerId);
        const email =
          !("deleted" in customer) && customer.email ? customer.email : null;
        if (!email) {
          log("Customer has no email; skipping subscribers upsert", { customerId });
          break;
        }

        const active =
          event.type !== "customer.subscription.deleted" &&
          ["active", "trialing", "past_due"].includes(sub.status);

        // Derive tier from price amount (mirrors check-subscription logic).
        let tier: string | null = null;
        try {
          const priceId = sub.items.data[0]?.price?.id;
          if (priceId) {
            const price = await stripe.prices.retrieve(priceId);
            const amount = price.unit_amount ?? 0;
            tier = amount <= 999 ? "Basic" : amount <= 1999 ? "Premium" : "Enterprise";
          }
        } catch (e) {
          log("Price lookup failed", { error: (e as Error).message });
        }

        const subscriptionEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000).toISOString()
          : null;

        const { error } = await admin.from("subscribers").upsert(
          {
            email,
            stripe_customer_id: customerId,
            subscribed: active,
            subscription_tier: active ? tier : null,
            subscription_end: active ? subscriptionEnd : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "email" },
        );
        if (error) log("subscribers upsert error", error);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        // Record a payment row only when tied to a subscription we track.
        const stripeSubId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id ?? null;
        if (!stripeSubId) break;

        // Look up internal subscription by Stripe metadata if present.
        const meta = (invoice.metadata ?? {}) as Record<string, string>;
        const internalSubId = meta.subscription_id || meta.internal_subscription_id;
        const internalUserId = meta.user_id;
        if (!internalSubId || !internalUserId) {
          log("Invoice missing internal IDs in metadata; skipping payment insert", {
            invoice: invoice.id,
          });
          break;
        }

        const { error } = await admin.from("payments").insert({
          subscription_id: internalSubId,
          user_id: internalUserId,
          payment_method: "stripe",
          amount: (invoice.amount_paid ?? 0) / 100,
          currency: (invoice.currency ?? "usd").toUpperCase(),
          stripe_payment_intent_id:
            typeof invoice.payment_intent === "string" ? invoice.payment_intent : null,
          status: "succeeded",
          processed_at: new Date().toISOString(),
        });
        if (error) log("payments insert error", error);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const meta = (invoice.metadata ?? {}) as Record<string, string>;
        const internalSubId = meta.subscription_id || meta.internal_subscription_id;
        const internalUserId = meta.user_id;
        if (!internalSubId || !internalUserId) break;

        const { error } = await admin.from("payments").insert({
          subscription_id: internalSubId,
          user_id: internalUserId,
          payment_method: "stripe",
          amount: (invoice.amount_due ?? 0) / 100,
          currency: (invoice.currency ?? "usd").toUpperCase(),
          status: "failed",
          failure_reason:
            invoice.last_finalization_error?.message ??
            "Stripe reported payment_failed",
        });
        if (error) log("payments failed insert error", error);
        break;
      }

      default:
        log("Unhandled event", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    log("Handler error", { error: (err as Error).message });
    // Return 200 to avoid Stripe retry storms on unrecoverable errors; the event
    // is logged for manual review.
    return new Response(JSON.stringify({ received: true, error: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});