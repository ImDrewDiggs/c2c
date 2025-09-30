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
    const {
      priceId,
      subscriptionType,
      selectedTier,
      unitCount = 1,
      customerEmail,
      serviceAddress,
      metadata = {}
    } = await req.json();

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    let customerId = null;
    let userId = null;

    // Get authenticated user if available
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        userId = data.user?.id;
        
        // Find or create Stripe customer
        if (data.user?.email) {
          const customers = await stripe.customers.list({ 
            email: data.user.email, 
            limit: 1 
          });
          
          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
          } else {
            const customer = await stripe.customers.create({
              email: data.user.email,
              metadata: {
                supabase_user_id: userId
              }
            });
            customerId = customer.id;
          }
        }
      } catch (authError) {
        console.warn("Auth error, proceeding without user context:", authError);
      }
    }

    // Build line items
    let lineItems = [];

    if (priceId) {
      lineItems = [{
        price: priceId,
        quantity: unitCount,
      }];
    } else {
      // Default pricing for one-time service
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Trash Can Cleaning Service',
            description: 'Professional trash can maintenance service',
          },
          unit_amount: 2500, // $25.00
        },
        quantity: 1,
      }];
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: lineItems,
      mode: subscriptionType ? 'subscription' : 'payment',
      success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout/error`,
      metadata: {
        userId: userId || '',
        subscriptionType: subscriptionType || '',
        selectedTier: selectedTier || '',
        unitCount: unitCount.toString(),
        serviceAddress: serviceAddress || '',
        ...metadata
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});