import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { ownsCheckout } from "../_shared/securityPolicy.ts";

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

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return new Response(null, { status: 405, headers: corsHeaders });

  try {
    const { sessionId } = await req.json();

    if (typeof sessionId !== "string" || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: authData, error: authError } = await supabaseService.auth.getUser(token);
    const user = authData.user;
    if (authError || !user) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: order } = await supabaseService.from("orders").select("id,status,metadata,service_address,total").eq("stripe_session_id", sessionId).eq("user_id", user.id).maybeSingle();
    if (!order) return new Response(JSON.stringify({ error: "Payment unavailable" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!ownsCheckout(user.id, session.metadata)) return new Response(JSON.stringify({ error: "Payment unavailable" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Update order status based on payment status
    if (session.payment_status === "paid") {
      // Update order status
      await supabaseService
        .from("orders")
        .update({ 
          status: "paid",
          updated_at: new Date().toISOString()
        })
        .eq("stripe_session_id", sessionId).eq("user_id", user.id);

      // If this is a subscription, create subscription record
      if (session.metadata?.flow !== "instant_quote") {
        const { data: existing } = await supabaseService.from("subscriptions").select("id").eq("user_id", user.id).contains("selected_features", { checkout_order_id: order.id }).maybeSingle();
        if (!existing) {
          const { error: subscriptionError } = await supabaseService.from("subscriptions").insert({
            user_id: user.id,
            plan_type: session.metadata?.subscriptionType || "single-family",
            selected_features: { ...order.metadata, checkout_order_id: order.id },
            unit_count: Number(session.metadata?.unitCount) || 1,
            total_price: order.total / 100,
            billing_cycle: session.mode === "subscription" ? "monthly" : "prepaid",
            status: "active",
            service_address: order.service_address,
          });
          if (subscriptionError) throw subscriptionError;
        }
      }

      // Qualify any pending referral for this user (idempotent)
      const refereeId = session.metadata?.userId;
      if (refereeId) {
        try {
          await supabaseService.rpc("qualify_referral", { _referee_user_id: refereeId });
        } catch (refErr) {
          console.warn("qualify_referral skipped:", refErr);
        }
      }

      // Mark abandoned-quote as converted so no reminder is sent.
      const resumeToken = session.metadata?.resume_token;
      if (resumeToken) {
        await supabaseService
          .from("abandoned_quotes")
          .update({ converted_at: new Date().toISOString() })
          .eq("resume_token", resumeToken);
      }
    }

    return new Response(JSON.stringify({ 
      status: session.payment_status,
      amountTotal: session.amount_total,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    // Generic error to client, log details server-side only
    return new Response(
      JSON.stringify({ error: 'Payment verification failed. Please try again.' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});