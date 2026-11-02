import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { ownsCheckout } from "../_shared/securityPolicy.ts";

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
  if (req.method !== "POST") return new Response(null, { status: 405, headers: corsHeaders });

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

    const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    const user = authData.user;
    if (authError || !user?.email) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    // Check the locally recorded owner BEFORE retrieving any Stripe data.
    const { data: order } = await admin.from("orders").select("id").eq("stripe_session_id", sessionId).eq("user_id", user.id).maybeSingle();
    if (!order) return new Response(JSON.stringify({ error: "Payment unavailable" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!ownsCheckout(user.id, session.metadata)) return new Response(JSON.stringify({ error: "Payment unavailable" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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

    const email = user.email.toLowerCase();
    if (!email) {
      return new Response(JSON.stringify({ error: "No email on session" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Provision only the authenticated order owner; never create or sign in another account.
    const userId = user.id;

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
    }).eq("stripe_session_id", sessionId).eq("user_id", userId);

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

    // If the quote flow passed a referral code, record it now that we have the user id
    if (m.referral_code) {
      try {
        // record_referral checks auth.uid(); we bypass by using service_role rpc-safe inserts:
        // find referrer via code and insert the referral directly.
        const { data: codeRow } = await admin
          .from("referral_codes")
          .select("user_id")
          .eq("code", String(m.referral_code).toUpperCase())
          .maybeSingle();
        if (codeRow?.user_id && codeRow.user_id !== userId) {
          const { data: alreadyReferred } = await admin
            .from("referrals")
            .select("id")
            .eq("referee_user_id", userId)
            .maybeSingle();
          if (!alreadyReferred) {
            await admin.from("referrals").insert({
              referrer_user_id: codeRow.user_id,
              referee_user_id: userId,
              referee_email: email,
              code: String(m.referral_code).toUpperCase(),
              status: "pending",
            });
          }
        }
      } catch (refErr) {
        console.warn("attach referral skipped:", refErr);
      }
    }

    // Reward the referrer (payment already succeeded to reach this point)
    try {
      await admin.rpc("qualify_referral", { _referee_user_id: userId });
    } catch (qErr) {
      console.warn("qualify_referral skipped:", qErr);
    }

    // Mark the abandoned-quote row as converted (blocks any pending reminder)
    if (m.resume_token) {
      await admin
        .from("abandoned_quotes")
        .update({ converted_at: new Date().toISOString() })
        .eq("resume_token", String(m.resume_token));
    }

    return new Response(JSON.stringify({
      status: "paid",
      provisioned: true,
      email,
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