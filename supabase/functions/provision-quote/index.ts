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

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== "string") {
      return new Response(JSON.stringify({ error: "Missing sessionId" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ status: session.payment_status, provisioned: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }

    const m = session.metadata || {};
    if (m.flow !== "instant_quote") {
      return new Response(JSON.stringify({ status: "paid", provisioned: false, reason: "not_quote_flow" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    }

    const email = (m.email || session.customer_details?.email || "").toLowerCase();
    if (!email) {
      return new Response(JSON.stringify({ error: "No email on session" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find or create the auth user
    let userId: string | null = null;
    const { data: existing } = await admin.auth.admin.listUsers();
    const match = existing?.users?.find((u) => (u.email || "").toLowerCase() === email);
    if (match) {
      userId = match.id;
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: session.customer_details?.name || email.split("@")[0], role: "customer" },
      });
      if (createErr) {
        console.error("createUser error:", createErr.message);
        return new Response(JSON.stringify({ error: "Account provisioning failed" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = created.user?.id ?? null;
    }
    if (!userId) {
      return new Response(JSON.stringify({ error: "User unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceAddress = `${m.address || ""}, ${m.city || ""}, ${m.state || ""} ${m.zip || ""}`.trim();
    const cans = parseInt(m.cans || "1", 10);
    const recycle = m.recycle === "1";
    const monthlyPrice = parseFloat(m.monthly_price || "0");
    const tier = m.tier || "Basic";

    // Attach order to user + mark paid
    await admin.from("orders").update({
      user_id: userId,
      status: "paid",
      updated_at: new Date().toISOString(),
    }).eq("stripe_session_id", sessionId);

    // Upsert house record (idempotent via address match)
    let houseId: string | null = null;
    const { data: existingHouse } = await admin.from("houses").select("id").eq("address", serviceAddress).maybeSingle();
    if (existingHouse?.id) {
      houseId = existingHouse.id;
    } else {
      const { data: newHouse, error: hErr } = await admin.from("houses").insert({
        address: serviceAddress,
        latitude: 0,
        longitude: 0,
      }).select("id").single();
      if (hErr) console.error("house insert error:", hErr.message);
      houseId = newHouse?.id ?? null;
    }

    // Create active subscription record (skip if already created for this session)
    const { data: existingSub } = await admin
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .eq("service_address", serviceAddress)
      .eq("status", "active")
      .maybeSingle();

    if (!existingSub) {
      const { error: sErr } = await admin.from("subscriptions").insert({
        user_id: userId,
        plan_type: `single_family_${tier.toLowerCase()}`,
        selected_features: { cans, recycle, trash_day: m.trash_day, tier, house_id: houseId },
        unit_count: cans,
        total_price: monthlyPrice,
        billing_cycle: "monthly",
        status: "active",
        service_address: serviceAddress,
      });
      if (sErr) console.error("subscription insert error:", sErr.message);
    }

    // Send magic link so they can sign in to dashboard without a password
    let magicLink: string | null = null;
    const { data: linkData } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${origin || allowedOrigins[0]}/customer/dashboard` },
    });
    magicLink = linkData?.properties?.action_link ?? null;

    return new Response(JSON.stringify({
      status: "paid",
      provisioned: true,
      email,
      magic_link: magicLink,
      service_address: serviceAddress,
      tier, cans, recycle, monthly_price: monthlyPrice,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (e) {
    console.error("provision-quote error:", e);
    return new Response(JSON.stringify({ error: "Provisioning failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});