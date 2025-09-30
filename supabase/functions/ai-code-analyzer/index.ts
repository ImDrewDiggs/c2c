import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '').trim();
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error('Authentication failed:', userError);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('User authenticated:', user.id);

    // Check if user has admin role
    const { data: hasRole, error: roleError } = await supabase.rpc('has_role', { 
      _user_id: user.id, 
      _role: 'admin' 
    });
    
    if (roleError) {
      console.error('Role check error:', roleError);
      return new Response(JSON.stringify({ error: 'Failed to verify admin access' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    if (!hasRole) {
      console.error('User does not have admin role:', user.id);
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Admin access verified for user:', user.id);

    const { analysisType, context } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = `You are an expert code analyzer for a waste management SaaS application. Your role is to:
1. Analyze the provided code, errors, and context
2. Identify bugs, missing functions, broken workflows, and edge cases
3. Diagnose the root cause of issues
4. Provide specific, actionable fixes with code examples

The application uses:
- React + TypeScript + Vite frontend
- Supabase backend with PostgreSQL
- Stripe for payments
- Edge functions for backend logic
- Row Level Security (RLS) for data access

Focus on: security vulnerabilities, missing error handling, broken data flows, authentication issues, payment integration problems, and database access issues.`;

    let userPrompt = '';
    
    switch (analysisType) {
      case 'full_scan':
        userPrompt = `Perform a comprehensive analysis of the application based on this context:
${JSON.stringify(context, null, 2)}

Provide a detailed report covering:
1. Critical bugs and security issues
2. Missing edge functions or broken endpoints
3. Database access and RLS policy issues
4. Payment integration problems
5. Authentication and authorization gaps
6. Performance bottlenecks
7. Suggested fixes with code examples`;
        break;
        
      case 'error_diagnosis':
        userPrompt = `Diagnose this specific error and provide a fix:
Error: ${context.error}
Stack trace: ${context.stackTrace}
Console logs: ${context.consoleLogs}
Network requests: ${context.networkRequests}

Provide:
1. Root cause analysis
2. Step-by-step fix with code examples
3. Prevention strategies`;
        break;
        
      case 'missing_features':
        userPrompt = `Analyze the application architecture and identify:
1. Missing edge functions referenced in code but not implemented
2. Broken workflows or incomplete features
3. Database tables without proper RLS policies
4. API endpoints that return errors

Context: ${JSON.stringify(context, null, 2)}`;
        break;
        
      default:
        userPrompt = `Analyze: ${context.query}
        
Context: ${JSON.stringify(context, null, 2)}`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required - add credits to Lovable AI' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices[0].message.content;

    // Log the analysis
    await supabase.from('enhanced_security_logs').insert({
      user_id: user.id,
      action_type: 'ai_code_analysis',
      resource_type: 'code_analyzer',
      risk_level: 'medium',
      metadata: {
        analysis_type: analysisType,
        timestamp: new Date().toISOString()
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      analysis,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in ai-code-analyzer:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
