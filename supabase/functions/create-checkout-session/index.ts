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
      subscriptionType, 
      selectedTier, 
      selectedServiceTypes = [], 
      unitCount = 1,
      total,
      isSubscription = true,
      contractLength,
      selectedServices = []
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

    let user = null;
    let customerId = undefined;

    // Try to get authenticated user
    try {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        user = data.user;
        
        if (user?.email) {
          // Check if Stripe customer exists
          const customers = await stripe.customers.list({ 
            email: user.email, 
            limit: 1 
          });
          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
          }
        }
      }
    } catch (error) {
      console.log("No authenticated user, proceeding as guest");
    }

    const origin = req.headers.get("origin") || "http://localhost:8080";

    // Prepare line items based on subscription type
    let lineItems = [];
    let mode: "payment" | "subscription" = isSubscription ? "subscription" : "payment";

    if (isSubscription) {
      // Create subscription line items
      if (subscriptionType === "single-family" && selectedTier) {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `${selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Plan - Single Family`,
              description: `Monthly ${selectedTier} plan subscription`
            },
            unit_amount: Math.round(total * 100),
            recurring: {
              interval: "month"
            }
          },
          quantity: 1,
        });
      } else if (subscriptionType === "multi-family") {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: "Multi-Family Service",
              description: `Service for ${unitCount} units`
            },
            unit_amount: Math.round((total / unitCount) * 100),
            recurring: {
              interval: "month"
            }
          },
          quantity: unitCount,
        });
      } else if (subscriptionType === "business") {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `Business ${selectedTier} Plan`,
              description: `Monthly business plan subscription`
            },
            unit_amount: Math.round(total * 100),
            recurring: {
              interval: "month"
            }
          },
          quantity: 1,
        });
      }
    } else {
      // One-time payment
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "One-Time Service",
            description: selectedServices.join(", ")
          },
          unit_amount: Math.round(total * 100),
        },
        quantity: 1,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : (user?.email || "guest@example.com"),
      line_items: lineItems,
      mode,
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/subscription`,
      metadata: {
        subscriptionType: subscriptionType || "",
        selectedTier: selectedTier || "",
        unitCount: unitCount.toString(),
        contractLength: contractLength || "",
        userId: user?.id || "",
      }
    });

    // Optionally store order in database
    if (user) {
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      await supabaseService.from("orders").insert({
        user_id: user.id,
        stripe_session_id: session.id,
        amount: Math.round(total * 100),
        currency: "usd",
        status: "pending",
        subscription_type: subscriptionType,
        selected_tier: selectedTier,
        unit_count: unitCount,
        contract_length: contractLength,
        is_subscription: isSubscription
      });
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});