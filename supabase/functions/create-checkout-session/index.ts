import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  computeSubscriptionQuote,
  contractLabel,
  normalizeContractMonths,
  type SubscriptionType,
} from "../_shared/subscriptionPricing.ts";

// Restrict CORS to known domains
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
  };
}

interface CheckoutRequestBody {
  subscriptionType?: string;
  planIds?: unknown;
  addOnNames?: unknown;
  unitCount?: unknown;
  contractMonths?: unknown;
  total?: unknown;
}

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    });

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as CheckoutRequestBody;

    const subscriptionType = body.subscriptionType as SubscriptionType;
    if (subscriptionType !== "single-family" && subscriptionType !== "multi-family") {
      return json({ error: 'Invalid service selection' }, 400);
    }

    const planIds = asStringArray(body.planIds);
    const addOnNames = asStringArray(body.addOnNames);
    const unitCount = Math.floor(Number(body.unitCount) || 1);
    const contractMonths = normalizeContractMonths(body.contractMonths);
    const clientTotal = Number(body.total);

    if (!Number.isFinite(clientTotal) || clientTotal < 0) {
      return json({ error: 'Invalid amount' }, 400);
    }

    // SERVER-AUTHORITATIVE PRICING — the client total is only cross-checked.
    const quote = computeSubscriptionQuote({
      subscriptionType,
      planIds,
      addOnNames,
      unitCount,
      contractMonths,
    });

    if (!quote.valid) {
      return json({ error: quote.reason ?? 'Invalid service selection' }, 400);
    }

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    if (Math.abs(quote.total - clientTotal) > 0.01) {
      console.error('Price mismatch detected', { expected: quote.total, clientTotal });
      await supabaseService.from('enhanced_security_logs').insert({
        action_type: 'price_manipulation_attempt',
        resource_type: 'checkout_session',
        risk_level: 'critical',
        metadata: {
          expectedTotal: quote.total,
          clientTotal,
          subscriptionType,
          planIds,
          addOnNames,
          unitCount,
          contractMonths,
        },
      });
      return json({ error: 'Price validation failed' }, 400);
    }

    // Authenticated users only — checkout is gated behind sign-in.
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: 'Authentication required' }, 401);
    }

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    const user = userData?.user;
    if (userError || !user?.email) {
      return json({ error: 'Authentication required' }, 401);
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const requestOrigin = req.headers.get("origin") || "http://localhost:8080";
    const label = contractLabel(quote.months);
    const planSummary = quote.planNames.join(" + ");
    const descriptionParts = [
      subscriptionType === "multi-family" ? `${quote.unitCount} units` : "Single family",
      `${label} plan`,
    ];
    if (addOnNames.length > 0) descriptionParts.push(`Add-ons: ${addOnNames.join(", ")}`);

    const isMonthly = quote.months === 1;
    const mode: "payment" | "subscription" = isMonthly ? "subscription" : "payment";

    // Charge tax-inclusive amounts: monthly recurring, or the full prepaid contract.
    const unitAmount = Math.round(quote.total * 100);

    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${planSummary} — Can2Curb`,
            description: descriptionParts.join(" · "),
          },
          unit_amount: unitAmount,
          ...(isMonthly ? { recurring: { interval: "month" as const } } : {}),
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
      mode,
      success_url: `${requestOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${requestOrigin}/checkout/cancel`,
      metadata: {
        subscriptionType,
        planIds: planIds.join(","),
        addOnNames: addOnNames.join(","),
        unitCount: String(quote.unitCount),
        contractMonths: String(quote.months),
        userId: user.id,
      },
    });

    await supabaseService.from("orders").insert({
      user_id: user.id,
      type: isMonthly ? "subscription" : "prepaid_contract",
      subtotal: Math.round(quote.subtotal * 100),
      tax: Math.round(quote.tax * 100),
      total: Math.round(quote.total * 100),
      currency: "usd",
      status: "pending",
      stripe_session_id: session.id,
      customer_email: user.email,
      metadata: {
        subscriptionType,
        planIds,
        addOnNames,
        unitCount: quote.unitCount,
        contractMonths: quote.months,
        monthlySubtotal: quote.monthlySubtotal,
      },
    });

    return json({ url: session.url }, 200);
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return json({ error: 'Payment processing failed. Please try again.' }, 500);
  }
});
