import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const allowedOrigins = [
  'https://100289ea-3c34-415f-a645-b7b29b76a548.lovableproject.com',
  'https://id-preview--100289ea-3c34-415f-a645-b7b29b76a548.lovable.app',
  'https://c2c.lovable.app',
  'https://c2c-site.site',
  'http://localhost:8080',
  'http://localhost:5173',
];

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// Server-side price ladder (USD/month). Source of truth — DO NOT trust client.
const PRICE_LADDER: Record<number, { tier: string; price: number }> = {
  1: { tier: "Basic", price: 24.99 },
  2: { tier: "Standard", price: 49.99 },
  3: { tier: "Premium", price: 79.99 },
  4: { tier: "Comprehensive", price: 119.99 },
  5: { tier: "Elite", price: 169.99 },
};

// Greater Cincinnati pickup-day defaults by ZIP prefix (Rumpke/city public schedule).
// Customers can override; this only pre-fills the selector.
const CINCY_ZIP_DAYS: Record<string, string> = {
  "45202": "monday", "45203": "monday", "45204": "tuesday", "45205": "tuesday",
  "45206": "wednesday", "45207": "wednesday", "45208": "thursday", "45209": "thursday",
  "45211": "friday", "45212": "friday", "45213": "monday", "45214": "tuesday",
  "45215": "wednesday", "45216": "thursday", "45217": "friday", "45218": "monday",
  "45219": "tuesday", "45220": "wednesday", "45223": "thursday", "45224": "friday",
  "45225": "monday", "45226": "tuesday", "45227": "wednesday", "45229": "thursday",
  "45230": "friday", "45231": "monday", "45232": "tuesday", "45233": "wednesday",
  "45236": "thursday", "45237": "friday", "45238": "monday", "45239": "tuesday",
  "45240": "wednesday", "45241": "thursday", "45242": "friday", "45243": "monday",
  "45244": "tuesday", "45245": "wednesday", "45246": "thursday", "45247": "friday",
  "45248": "monday", "45249": "tuesday", "45251": "wednesday", "45252": "thursday",
  "45255": "friday",
};

function priceFor(cans: number) {
  const capped = Math.max(1, Math.min(5, Math.floor(cans)));
  return PRICE_LADDER[capped] ?? PRICE_LADDER[5];
}

function sanitize(input: unknown, max = 200): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, max).replace(/[\u0000-\u001F\u007F]/g, "");
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const address = sanitize(body.address, 250);
    const city = sanitize(body.city, 100);
    const state = sanitize(body.state, 2).toUpperCase();
    const zip = sanitize(body.zip, 10);
    const email = sanitize(body.email, 254).toLowerCase();
    const trashDay = sanitize(body.trashDay, 20).toLowerCase();
    const cans = Number(body.cans);
    const recycle = !!body.recycle;

    // Validate
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const zipOk = /^\d{5}$/.test(zip);
    const dayOk = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].includes(trashDay);
    if (!address || !city || !state || !zipOk || !emailOk || !dayOk || !Number.isFinite(cans) || cans < 1) {
      return new Response(JSON.stringify({ error: "Invalid quote data" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SERVER price (effective cans = cans + recycle add-on counts as 1)
    const effectiveCans = recycle ? cans + 1 : cans;
    const { tier, price } = priceFor(effectiveCans);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Try to attach to existing Stripe customer if any
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customerId = customers.data[0]?.id;

    const requestOrigin = origin || allowedOrigins[0];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `Can2Curb ${tier} Plan`,
            description: `${effectiveCans} can${effectiveCans > 1 ? "s" : ""} concierge — pickup ${trashDay[0].toUpperCase() + trashDay.slice(1)}`,
          },
          unit_amount: Math.round(price * 100),
          recurring: { interval: "month" },
        },
        quantity: 1,
      }],
      success_url: `${requestOrigin}/quote/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${requestOrigin}/?quote=cancelled`,
      metadata: {
        flow: "instant_quote",
        address, city, state, zip,
        trash_day: trashDay,
        cans: String(cans),
        recycle: recycle ? "1" : "0",
        tier,
        monthly_price: String(price),
        email,
      },
    });

    // Pre-record pending order (no user_id yet; provisioning attaches it)
    await supabaseService.from("orders").insert({
      user_id: null,
      type: "subscription",
      subtotal: Math.round(price * 100),
      tax: 0,
      total: Math.round(price * 100),
      currency: "usd",
      status: "pending",
      stripe_session_id: session.id,
      customer_email: email,
      service_address: `${address}, ${city}, ${state} ${zip}`,
      metadata: { flow: "instant_quote", tier, cans, recycle, trash_day: trashDay },
    }).then(({ error }) => {
      if (error) console.error("orders insert failed (non-fatal):", error.message);
    });

    return new Response(JSON.stringify({ url: session.url, tier, price }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("instant-quote-checkout error:", e);
    return new Response(JSON.stringify({ error: "Checkout failed. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

export { CINCY_ZIP_DAYS };