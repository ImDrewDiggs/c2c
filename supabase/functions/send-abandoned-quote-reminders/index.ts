// Sends a resume-link email for quotes older than 1 hour that never converted.
// Trigger via scheduled cron (see supabase/config.toml) or manual POST.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = Deno.env.get("PUBLIC_SITE_URL") || "https://c2c.lovable.app";
const FROM = Deno.env.get("REMINDER_FROM_EMAIL") || "Can2Curb <hello@can2curb.com>";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.error("[reminders] RESEND_API_KEY missing");
    return new Response(JSON.stringify({ error: "Email not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: quotes, error } = await admin
    .from("abandoned_quotes")
    .select("id,resume_token,email,tier,price_cents,cans")
    .is("converted_at", null)
    .is("reminder_sent_at", null)
    .not("email", "is", null)
    .lte("created_at", cutoff)
    .limit(50);

  if (error) {
    console.error("[reminders] query error", error);
    return new Response(JSON.stringify({ error: "Query failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let sent = 0;
  for (const q of quotes ?? []) {
    const resumeUrl = `${SITE_URL}/?resume=${q.resume_token}`;
    const price = q.price_cents ? `$${(q.price_cents / 100).toFixed(2)}/mo` : "your quote";
    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#0f172a">
        <h1 style="font-size:22px;margin:0 0 12px">Finish your Can2Curb quote</h1>
        <p style="color:#334155;line-height:1.5">
          You started setting up trash-can service for ${q.cans ?? ""} can${q.cans === 1 ? "" : "s"}
          and we saved your spot. Your ${q.tier ?? "custom"} plan is ready at <b>${price}</b>.
        </p>
        <p style="margin:24px 0">
          <a href="${resumeUrl}"
             style="background:#16a34a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">
             Resume my quote
          </a>
        </p>
        <p style="color:#64748b;font-size:13px">
          Or paste this link in your browser:<br />
          <span style="word-break:break-all">${resumeUrl}</span>
        </p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [q.email],
        subject: "Your Can2Curb quote is waiting",
        html,
      }),
    });

    if (res.ok) {
      await admin
        .from("abandoned_quotes")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", q.id);
      sent += 1;
    } else {
      const t = await res.text();
      console.error("[reminders] resend failed", { email: q.email, status: res.status, t });
    }
  }

  return new Response(JSON.stringify({ ok: true, sent, considered: quotes?.length ?? 0 }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});