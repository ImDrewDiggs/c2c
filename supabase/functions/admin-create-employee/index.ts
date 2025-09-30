import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

interface CreateEmployeePayload {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  address?: string;
  job_title?: string;
  pay_rate?: number;
}

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'https://c2c.lovable.app'
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
}

function corsHeaders(origin?: string | null) {
  const allowedOrigin = origin && isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    // Initialize Supabase clients
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Verify requester is authenticated and is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        status: 401,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        status: 401,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    // Check if user has admin role
    const { data: hasRole, error: roleError } = await supabaseUser.rpc("has_role", {
      _user_id: user.id,
      _role: "admin"
    });

    if (roleError || !hasRole) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    const payload: CreateEmployeePayload = await req.json();

    // Validate required fields
    if (!payload.email || !payload.password || !payload.full_name) {
      return new Response(JSON.stringify({ 
        error: "Missing required fields: email, password, full_name" 
      }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    // Create user in auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      email_confirm: true
    });

    if (createError || !newUser.user) {
      console.error("Error creating user:", createError);
      return new Response(JSON.stringify({ 
        error: createError?.message || "Failed to create user account" 
      }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

    try {
      // Create employee profile
      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: newUser.user.id,
          email: payload.email,
          full_name: payload.full_name,
          phone: payload.phone,
          address: payload.address,
          job_title: payload.job_title || 'Employee',
          pay_rate: payload.pay_rate,
          role: 'employee',
          status: 'active'
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        
        // Rollback: delete the auth user
        await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
        
        return new Response(JSON.stringify({ 
          error: "Failed to create employee profile" 
        }), {
          status: 500,
          headers: { ...headers, "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ 
        success: true,
        employee: {
          id: newUser.user.id,
          email: payload.email,
          full_name: payload.full_name,
          job_title: payload.job_title || 'Employee'
        }
      }), {
        status: 200,
        headers: { ...headers, "Content-Type": "application/json" }
      });

    } catch (error) {
      console.error("Employee creation process failed:", error);
      
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      
      return new Response(JSON.stringify({ 
        error: "Employee creation failed" 
      }), {
        status: 500,
        headers: { ...headers, "Content-Type": "application/json" }
      });
    }

  } catch (error) {
    console.error("Error in admin-create-employee function:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error" 
    }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" }
    });
  }
});