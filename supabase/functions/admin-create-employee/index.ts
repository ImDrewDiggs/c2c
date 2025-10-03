// Supabase Edge Function: admin-create-employee
// Creates an auth user and profile for an employee using the service role key
// Deno runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface CreateEmployeePayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  address?: string;
  driversLicense?: string;
  payRate?: number;
  jobTitle?: string;
}

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    const host = u.hostname.toLowerCase();
    // Allow Lovable preview domains; update with your production domain(s)
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

    // Client bound to the caller's JWT for authorization checks
    const supabaseUser = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("authorization") ?? "" } },
    });

    // Verify requester is authenticated
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

    const body = (await req.json()) as CreateEmployeePayload;
    const { email, password, fullName, phone, address, driversLicense, payRate, jobTitle } = body;

    if (!email || !password || !fullName) {
      return new Response(JSON.stringify({ error: "email, password and fullName are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || typeof fullName !== "string" || fullName.trim().length < 2 || String(password).length < 8) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Basic rate limiting: max 5 create requests per minute per admin
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { count: reqCount, error: rateErr } = await supabaseAdmin
      .from("security_audit_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userDataAuth.user.id)
      .eq("event_type", "admin_create_employee")
      .gte("created_at", oneMinuteAgo);

    if (!rateErr && typeof reqCount === "number" && reqCount >= 5) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a minute and try again." }), {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Create auth user (email confirmed to allow immediate login)
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "employee", full_name: fullName },
    });

    if (createError || !userData?.user) {
      return new Response(JSON.stringify({ error: createError?.message || "Failed to create user" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const userId = userData.user.id;

    // Upsert profile
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email,
      role: "employee",
      full_name: fullName,
      phone: phone ?? null,
      address: address ?? null,
      drivers_license: driversLicense ?? null,
      pay_rate: typeof payRate === "number" ? payRate : null,
      job_title: jobTitle ?? "Employee",
      status: "active",
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      // Rollback auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    // Attempt to log security audit event (non-fatal)
    try {
      await supabaseAdmin.from("security_audit_logs").insert({
        user_id: userDataAuth.user.id,
        event_type: "admin_create_employee",
        event_details: { target_user_id: userId, email },
      });
    } catch (_) {
      // Ignore logging errors to not block primary action
    }

    return new Response(JSON.stringify({ success: true, userId }), {
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
