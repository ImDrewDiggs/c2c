import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
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
          stripe_payment_intent_id: session.payment_intent as string,
          updated_at: new Date().toISOString()
        })
        .eq("stripe_session_id", sessionId);

      // If this is a subscription, create subscription record
      if (session.mode === "subscription" && session.subscription) {
        try {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          await supabaseService.from("subscriptions").upsert({
            user_id: session.metadata?.userId || null,
            service_id: null, // Will be linked later if needed
            plan_type: session.metadata?.subscriptionType || "basic",
            billing_cycle: "monthly",
            status: subscription.status,
            total_price: subscription.items.data[0]?.price.unit_amount || 0,
            unit_count: parseInt(session.metadata?.unitCount || "1"),
            service_address: session.metadata?.serviceAddress,
            billing_address: session.customer_details?.address ? {
              line1: session.customer_details.address.line1,
              line2: session.customer_details.address.line2,
              city: session.customer_details.address.city,
              state: session.customer_details.address.state,
              postal_code: session.customer_details.address.postal_code,
              country: session.customer_details.address.country
            } : null,
            selected_features: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

          // Update subscribers table for subscription status tracking
          if (session.metadata?.userId && session.customer_details?.email) {
            await supabaseService.from("subscribers").upsert({
              user_id: session.metadata.userId,
              email: session.customer_details.email,
              subscribed: true,
              subscription_tier: session.metadata?.selectedTier || "basic",
              stripe_customer_id: subscription.customer as string,
              subscription_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        } catch (subscriptionError) {
          console.error("Error handling subscription:", subscriptionError);
          // Don't fail the entire request for subscription errors
        }
      }

      // Create payment record
      if (session.metadata?.userId) {
        try {
          await supabaseService.from("payments").insert({
            user_id: session.metadata.userId,
            subscription_id: null, // Will be linked if it's a subscription
            amount: session.amount_total || 0,
            currency: session.currency || "usd",
            payment_method: "stripe",
            status: "completed",
            stripe_payment_intent_id: session.payment_intent as string,
            processed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        } catch (paymentError) {
          console.error("Error creating payment record:", paymentError);
          // Don't fail the entire request for payment record errors
        }
      }
    }

    return new Response(JSON.stringify({ 
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
      amountTotal: session.amount_total,
      currency: session.currency,
      metadata: session.metadata,
      subscriptionId: session.subscription,
      paymentIntentId: session.payment_intent
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});