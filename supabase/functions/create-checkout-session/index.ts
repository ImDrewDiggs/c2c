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

    // Input validation
    if (!subscriptionType || !selectedTier) {
      return new Response(
        JSON.stringify({ error: 'Invalid service selection' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (unitCount < 1 || unitCount > 1000) {
      return new Response(
        JSON.stringify({ error: 'Invalid unit count' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (total < 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase service client for price validation
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // SERVER-SIDE PRICE VALIDATION - Critical security fix
    // Verify the price against database to prevent manipulation
    const { data: service, error: serviceError } = await supabaseService
      .from('services')
      .select('price, category, name')
      .eq('category', subscriptionType)
      .eq('name', selectedTier)
      .single();

    if (serviceError || !service) {
      console.error('Service validation error:', serviceError);
      return new Response(
        JSON.stringify({ error: 'Invalid service selected' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Calculate expected total server-side
    const basePrice = Number(service.price);
    const contractMultiplier = contractLength === '6-month' ? 6 : 
                              contractLength === '12-month' ? 12 : 1;
    const expectedTotal = basePrice * unitCount * contractMultiplier;

    // Verify client-provided total matches (allow 1 cent variance for rounding)
    if (Math.abs(expectedTotal - total) > 0.01) {
      console.error('Price manipulation attempt detected', {
        expectedTotal,
        clientTotal: total,
        difference: expectedTotal - total,
        service: selectedTier,
        unitCount,
        contractLength
      });

      // Log security event
      await supabaseService.from('enhanced_security_logs').insert({
        action_type: 'price_manipulation_attempt',
        resource_type: 'checkout_session',
        risk_level: 'critical',
        metadata: {
          expectedTotal,
          clientTotal: total,
          difference: expectedTotal - total,
          service: selectedTier,
          unitCount,
          contractLength
        }
      });

      return new Response(
        JSON.stringify({ error: 'Price validation failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create Supabase client for user auth
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

    const requestOrigin = req.headers.get("origin") || "http://localhost:8080";

    // Prepare line items based on subscription type (use server-validated total)
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
            unit_amount: Math.round(expectedTotal * 100), // Use server-validated price
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
            unit_amount: Math.round((expectedTotal / unitCount) * 100), // Use server-validated price
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
            unit_amount: Math.round(expectedTotal * 100), // Use server-validated price
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
          unit_amount: Math.round(expectedTotal * 100), // Use server-validated price
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
      success_url: `${requestOrigin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${requestOrigin}/subscription`,
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
      await supabaseService.from("orders").insert({
        user_id: user.id,
        stripe_session_id: session.id,
        amount: Math.round(expectedTotal * 100), // Use server-validated price
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
    // Generic error to client, log details server-side only
    return new Response(
      JSON.stringify({ error: 'Payment processing failed. Please try again.' }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
