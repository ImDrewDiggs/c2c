// Returns a saved abandoned-quote by its unguessable resume_token.
// Public endpoint; token is a UUID so knowing it acts as bearer auth.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const token = (url.searchParams.get("token") || "").trim();
    if (!/^[0-9a-f-]{20,64}$/i.test(token)) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data, error } = await admin
      .from("abandoned_quotes")
      .select(
        "resume_token,email,address,city,state,zip,trash_day,cans,recycle,referral_code,step,tier,price_cents,converted_at",
      )
      .eq("resume_token", token)
      .maybeSingle();

    if (error) throw error;
    if (!data)
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    return new Response(JSON.stringify({ quote: data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[get-quote] error", err);
    return new Response(JSON.stringify({ error: "Failed to load quote" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});