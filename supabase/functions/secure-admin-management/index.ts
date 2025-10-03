import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

interface CreateAdminRequest {
  email: string;
  role: 'admin' | 'super_admin';
}

// CORS configuration with environment-based origins
function isAllowedOrigin(origin: string | null): boolean {
  const allowedOrigins = [
    'https://iagkylxqlartqokuiahf.supabase.co',
    'http://localhost:5173',
    'http://localhost:3000',
    // Add production domain here when deployed
  ];
  
  return origin ? allowedOrigins.includes(origin) : false;
}

function corsHeaders(origin?: string) {
  const allowedOrigin = origin && isAllowedOrigin(origin) ? origin : 'https://iagkylxqlartqokuiahf.supabase.co';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders(origin) 
    });
  }

  // Validate origin for security
  if (!isAllowedOrigin(origin)) {
    return new Response(
      JSON.stringify({ error: 'Origin not allowed' }), 
      { 
        status: 403, 
        headers: corsHeaders() 
      }
    );
  }

  try {
    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Client for user authentication
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: corsHeaders(origin) }
      );
    }

    // Set the auth for user client
    supabaseUser.auth.session = () => ({ access_token: authHeader.split(' ')[1] });

    // Verify the user is authenticated and is super admin
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: corsHeaders(origin) }
      );
    }

    // Check if user is super admin using the new RBAC system
    const { data: isSuperAdmin, error: roleError } = await supabaseUser.rpc('is_super_admin_user', {
      check_user_id: user.id
    });

    if (roleError || !isSuperAdmin) {
      // Log unauthorized access attempt
      await supabaseAdmin.from('enhanced_security_logs').insert({
        user_id: user.id,
        action_type: 'unauthorized_admin_access',
        risk_level: 'critical',
        metadata: {
          attempted_action: 'admin_management',
          user_email: user.email,
          timestamp: new Date().toISOString()
        }
      });

      return new Response(
        JSON.stringify({ error: 'Insufficient permissions - Super admin required' }),
        { status: 403, headers: corsHeaders(origin) }
      );
    }

    // Rate limiting check
    const { data: rateLimitExceeded } = await supabaseUser.rpc('check_rate_limit', {
      limit_identifier: user.id,
      action_type: 'admin_management',
      max_attempts: 10,
      window_minutes: 60
    });

    if (rateLimitExceeded) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
        { status: 429, headers: corsHeaders(origin) }
      );
    }

    // Handle different admin management operations
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'create':
        return await handleCreateAdmin(req, supabaseUser, supabaseAdmin, user, origin);
      case 'list':
        return await handleListUsers(supabaseUser, origin);
      case 'revoke':
        return await handleRevokeAdmin(req, supabaseUser, supabaseAdmin, user, origin);
      case 'audit':
        return await handleAuditLogs(supabaseUser, origin);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: corsHeaders(origin) }
        );
    }

  } catch (error) {
    console.error('Admin management error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders(origin) }
    );
  }
});

async function handleCreateAdmin(
  req: Request, 
  supabaseUser: any, 
  supabaseAdmin: any, 
  currentUser: any, 
  origin: string | null
) {
  const { email, role }: CreateAdminRequest = await req.json();

  if (!email || !role) {
    return new Response(
      JSON.stringify({ error: 'Email and role are required' }),
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  // Use the secure admin creation function
  const { data: result, error } = await supabaseUser.rpc('create_admin_user', {
    target_email: email.toLowerCase(),
    target_role: role,
    requesting_user_id: currentUser.id
  });

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  return new Response(
    JSON.stringify(result),
    { status: 200, headers: corsHeaders(origin) }
  );
}

async function handleListUsers(supabaseUser: any, origin: string | null) {
  // Get all users with their roles
  const { data: users, error } = await supabaseUser
    .from('profiles')
    .select(`
      id, email, full_name, role, status, created_at,
      user_roles:user_roles(role, is_active, expires_at)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  return new Response(
    JSON.stringify({ users }),
    { status: 200, headers: corsHeaders(origin) }
  );
}

async function handleRevokeAdmin(
  req: Request,
  supabaseUser: any,
  supabaseAdmin: any,
  currentUser: any,
  origin: string | null
) {
  const { userId, role } = await req.json();

  if (!userId || !role) {
    return new Response(
      JSON.stringify({ error: 'User ID and role are required' }),
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  // Prevent self-revocation
  if (userId === currentUser.id) {
    return new Response(
      JSON.stringify({ error: 'Cannot revoke your own admin privileges' }),
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  // Deactivate the role
  const { error: roleError } = await supabaseAdmin
    .from('user_roles')
    .update({ 
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('role', role);

  if (roleError) {
    return new Response(
      JSON.stringify({ error: roleError.message }),
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  // Update profile role to customer if no other admin roles exist
  const { data: remainingAdminRoles } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('is_active', true)
    .in('role', ['admin', 'super_admin']);

  if (!remainingAdminRoles || remainingAdminRoles.length === 0) {
    await supabaseAdmin
      .from('profiles')
      .update({ 
        role: 'customer',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
  }

  // Log the action
  await supabaseAdmin.from('enhanced_security_logs').insert({
    user_id: currentUser.id,
    action_type: 'admin_role_revoked',
    resource_type: 'user',
    resource_id: userId,
    old_values: { role, is_active: true },
    new_values: { role, is_active: false },
    risk_level: 'critical',
    metadata: {
      revoked_by: currentUser.email,
      timestamp: new Date().toISOString()
    }
  });

  return new Response(
    JSON.stringify({ success: true, message: 'Admin role revoked successfully' }),
    { status: 200, headers: corsHeaders(origin) }
  );
}

async function handleAuditLogs(supabaseUser: any, origin: string | null) {
  const { data: logs, error } = await supabaseUser
    .from('enhanced_security_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: corsHeaders(origin) }
    );
  }

  return new Response(
    JSON.stringify({ logs }),
    { status: 200, headers: corsHeaders(origin) }
  );
}