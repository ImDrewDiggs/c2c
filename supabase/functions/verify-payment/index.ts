import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Restrict CORS to known domains
const allowedOrigins = [
  'https://100289ea-3c34-415f-a645-b7b29b76a548.lovableproject.com',
  'https://id-preview--100289ea-3c34-415f-a645-b7b29b76a548.lovable.app',
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

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Session ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Create Supabase service client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Update order status based on payment status
    if (session.payment_status === "paid") {
      // Update order status
      await supabaseService
        .from("orders")
        .update({ 
          status: "paid",
          updated_at: new Date().toISOString()
        })
        .eq("stripe_session_id", sessionId);

      // If this is a subscription, create subscription record
      if (session.mode === "subscription" && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        await supabaseService.from("subscriptions").upsert({
          user_id: session.metadata?.userId || null,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          subscription_type: session.metadata?.subscriptionType || "",
          selected_tier: session.metadata?.selectedTier || "",
          unit_count: parseInt(session.metadata?.unitCount || "1"),
          contract_length: session.metadata?.contractLength || "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    return new Response(JSON.stringify({ 
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      amountTotal: session.amount_total,
      metadata: session.metadata
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