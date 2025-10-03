// Supabase Edge Function: admin-delete-user
// Deletes an auth user and their profile using the service role key
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface DeleteUserPayload { userId: string }

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    const host = u.hostname.toLowerCase();
    if (host.endsWith(".lovableproject.com")) return true;
    return ALLOWED_ORIGINS.includes(origin);
  } catch {
    return false;
  }
}

function corsHeaders(origin?: string) {
  const allowed = origin && isAllowedOrigin(origin) ? origin : "*";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  } as Record<string, string>;
}

serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders(origin) });
  }
  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase environment variables" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Client bound to caller's JWT for authorization checks
    const supabaseUser = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("authorization") ?? "" } },
    });

    const { data: userDataAuth, error: userAuthError } = await supabaseUser.auth.getUser();
    if (userAuthError || !userDataAuth?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Verify requester is admin (defense-in-depth)
    const { data: isAdmin, error: roleError } = await supabaseUser.rpc("has_role", {
      _user_id: userDataAuth.user.id,
      _role: "admin",
    });
    const { data: isAdminEmail, error: emailCheckError } = await supabaseUser.rpc("is_admin_by_email");
    if (roleError || emailCheckError || !isAdmin || !isAdminEmail) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const body = (await req.json()) as DeleteUserPayload;
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return new Response(JSON.stringify({ error: "Invalid userId format" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Basic rate limiting: max 10 delete requests per minute per admin
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { count: reqCount, error: rateErr } = await supabaseAdmin
      .from("security_audit_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userDataAuth.user.id)
      .eq("event_type", "admin_delete_user")
      .gte("created_at", oneMinuteAgo);

    if (!rateErr && typeof reqCount === "number" && reqCount >= 10) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a minute and try again." }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Prevent deleting self by mistake (optional safeguard)
    if (userId === userDataAuth.user.id) {
      return new Response(JSON.stringify({ error: "You cannot delete your own account" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Delete profile first (cleanup)
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // Delete auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Attempt to log security audit event (non-fatal)
    try {
      await supabaseAdmin.from("security_audit_logs").insert({
        user_id: userDataAuth.user.id,
        event_type: "admin_delete_user",
        event_details: { target_user_id: userId },
      });
    } catch (_) {
      // ignore logging errors
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders() },
    });
  }
});
