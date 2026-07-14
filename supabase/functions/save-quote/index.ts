// Persists partial instant-quote data so we can email a resume link.
// Public endpoint. Anyone can create/update a quote by resume_token.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRICE_LADDER: Record<number, { tier: string; price: number }> = {
  1: { tier: "Basic", price: 24.99 },
  2: { tier: "Standard", price: 49.99 },
  3: { tier: "Premium", price: 79.99 },
  4: { tier: "Comprehensive", price: 119.99 },
  5: { tier: "Elite", price: 169.99 },
};

const clampStr = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : null;
const clampInt = (v: unknown, min: number, max: number) => {
  const n = typeof v === "number" ? v : parseInt(String(v), 10);
  if (!Number.isFinite(n)) return null;
  return Math.max(min, Math.min(max, n));
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const body = await req.json();
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const cans = clampInt(body.cans, 1, 5);
    const recycle = !!body.recycle;
    let tier: string | null = null;
    let priceCents: number | null = null;
    if (cans) {
      const effective = Math.max(1, Math.min(5, recycle ? cans + 1 : cans));
      const p = PRICE_LADDER[effective];
      tier = p.tier;
      priceCents = Math.round(p.price * 100);
    }

    const payload = {
      email: clampStr(body.email, 320)?.toLowerCase() || null,
      address: clampStr(body.address, 300),
      city: clampStr(body.city, 100),
      state: clampStr(body.state, 4)?.toUpperCase() || null,
      zip: clampStr(body.zip, 10),
      trash_day: clampStr(body.trashDay, 20)?.toLowerCase() || null,
      cans,
      recycle,
      referral_code: clampStr(body.referralCode, 32)?.toUpperCase() || null,
      step: clampInt(body.step, 0, 3) ?? 0,
      tier,
      price_cents: priceCents,
      user_agent: clampStr(req.headers.get("user-agent"), 300),
      updated_at: new Date().toISOString(),
    };

    const tokenIn = clampStr(body.resumeToken, 64);
    if (tokenIn) {
      const { data, error } = await admin
        .from("abandoned_quotes")
        .update(payload)
        .eq("resume_token", tokenIn)
        .is("converted_at", null)
        .select("resume_token")
        .maybeSingle();
      if (error) throw error;
      if (data?.resume_token) {
        return new Response(JSON.stringify({ resumeToken: data.resume_token }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data, error } = await admin
      .from("abandoned_quotes")
      .insert(payload)
      .select("resume_token")
      .single();
    if (error) throw error;

    return new Response(JSON.stringify({ resumeToken: data.resume_token }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[save-quote] error", err);
    return new Response(JSON.stringify({ error: "Failed to save quote" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});