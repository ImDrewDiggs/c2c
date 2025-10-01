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

    const systemPrompt = `You are an expert full-stack code analyzer and debugger for a waste management SaaS application. Your role is to:

1. **Deep Code Analysis**: Examine React components, TypeScript code, edge functions, database schemas, and RLS policies
2. **Bug Detection**: Identify runtime errors, logic bugs, type errors, infinite loops, memory leaks, and race conditions
3. **Security Auditing**: Find vulnerabilities in RLS policies, authentication flows, API endpoints, and data handling
4. **Performance Analysis**: Detect slow queries, inefficient rendering, memory issues, and optimization opportunities
5. **Root Cause Diagnosis**: Trace issues to their source, analyze stack traces, and identify cascading failures
6. **Actionable Solutions**: Provide specific, tested code fixes with explanations, not generic suggestions

**Technology Stack:**
- Frontend: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- Backend: Supabase (PostgreSQL + RLS + Edge Functions + Auth)
- Payments: Stripe integration
- State Management: React Context + React Query
- Routing: React Router

**Common Issue Patterns:**
- RLS policy recursion and permission denial
- Edge function authentication failures and CORS issues
- React hooks dependency arrays and infinite re-renders
- TypeScript type mismatches and null/undefined handling
- Supabase client usage and query errors
- Stripe webhook validation and payment flows

**Analysis Approach:**
1. Read all error messages and stack traces carefully
2. Examine the database schema and RLS policies for access issues
3. Review edge function logs for authentication and runtime errors
4. Check React component lifecycle and state management
5. Verify API calls, error handling, and data flows
6. Identify missing error boundaries and fallbacks
7. Suggest specific code changes with file paths and line numbers

**Response Format:**
For each issue found:
- **Issue**: Clear description of the problem
- **Location**: File path, function/component name, line numbers
- **Root Cause**: Why this is happening
- **Impact**: Severity and user-facing consequences
- **Fix**: Exact code to add/change with explanations
- **Prevention**: How to avoid similar issues

Be thorough, specific, and actionable. Provide code examples that can be directly applied.`;

    let userPrompt = '';
    
    switch (analysisType) {
      case 'full_scan':
        userPrompt = `**COMPREHENSIVE APPLICATION SCAN**

Analyze every aspect of this waste management SaaS application:

**Context Data:**
${JSON.stringify(context, null, 2)}

**Required Analysis:**

1. **Critical Security Issues** (PRIORITY 1)
   - RLS policy vulnerabilities and privilege escalation risks
   - Authentication bypass opportunities
   - Exposed admin endpoints or sensitive data
   - SQL injection or XSS vulnerabilities
   - Insecure edge function implementations

2. **Database & Schema Issues**
   - Missing RLS policies on tables with sensitive data
   - Recursive RLS policy problems
   - Foreign key constraints and referential integrity
   - Missing indexes causing slow queries
   - Data type mismatches and constraint violations

3. **Edge Function Problems**
   - Functions returning non-2xx status codes
   - CORS configuration errors
   - JWT validation failures
   - Missing error handling and logging
   - Rate limiting and abuse prevention

4. **Frontend React Issues**
   - Infinite rendering loops
   - Memory leaks from uncleaned effects
   - Missing error boundaries
   - Improper hook dependencies
   - Type safety violations

5. **API & Integration Issues**
   - Broken Supabase client calls
   - Stripe payment flow problems
   - Webhook validation failures
   - Missing API error handling

6. **Performance Bottlenecks**
   - N+1 query problems
   - Unnecessary re-renders
   - Unoptimized bundle size
   - Slow database queries

7. **Missing Features & Broken Workflows**
   - Referenced but unimplemented functions
   - Incomplete user journeys
   - Dead code and unused imports

**For each issue, provide:**
- Exact file path and line numbers
- Severity rating (Critical/High/Medium/Low)
- Complete code fix with before/after examples
- Testing instructions
- Prevention recommendations`;
        break;
        
      case 'error_diagnosis':
        userPrompt = `**ERROR DIAGNOSTIC ANALYSIS**

Diagnose and fix this specific error:

**Error Details:**
- Error: ${context.error || 'Not provided'}
- Stack Trace: ${context.stackTrace || 'Not provided'}
- Console Logs: ${context.consoleLogs || 'Not provided'}
- Network Requests: ${context.networkRequests || 'Not provided'}
- User Agent: ${context.userAgent || 'Not provided'}
- URL: ${context.url || 'Not provided'}

**Additional Context:**
${JSON.stringify(context, null, 2)}

**Required Analysis:**

1. **Root Cause Identification**
   - What exactly is causing this error?
   - Is it a frontend or backend issue?
   - What triggered the error sequence?
   - Are there any cascading failures?

2. **Immediate Impact**
   - What functionality is broken?
   - Which users are affected?
   - Is data at risk?
   - Are there security implications?

3. **Complete Fix**
   - Exact code changes needed (file paths + line numbers)
   - Any database migrations required
   - Edge function updates needed
   - Environment variable changes

4. **Testing Instructions**
   - How to verify the fix works
   - Test cases to prevent regression
   - Monitoring to add

5. **Prevention Strategy**
   - Code patterns to avoid
   - Validation to add
   - Logging improvements
   - Error boundaries needed`;
        break;
        
      case 'missing_features':
        userPrompt = `**MISSING FEATURES & GAPS ANALYSIS**

Identify all incomplete implementations and missing functionality:

**Context:**
${JSON.stringify(context, null, 2)}

**Search for:**

1. **Unimplemented Edge Functions**
   - Functions called from frontend but not deployed
   - Edge function stubs without logic
   - Missing RPC functions in database

2. **Incomplete Workflows**
   - User journeys that dead-end
   - Forms without submission handlers
   - Buttons that don't do anything
   - Missing confirmation/success states

3. **Database Gaps**
   - Tables without RLS policies (security risk!)
   - Missing foreign key relationships
   - Columns that should be indexed but aren't
   - Triggers that should exist but don't

4. **Authentication Issues**
   - Routes without auth guards
   - Missing role checks
   - Unprotected API endpoints
   - Session management problems

5. **Integration Gaps**
   - Stripe webhooks not handled
   - Email notifications not sent
   - File uploads without storage policies
   - Real-time subscriptions not configured

6. **Error Handling Gaps**
   - API calls without try-catch
   - Missing error boundaries
   - No fallback UI for failures
   - Unhandled promise rejections

**For each gap, provide:**
- What's missing and why it matters
- Severity and user impact
- Complete implementation code
- Testing checklist`;
        break;
        
      case 'security_audit':
        userPrompt = `**SECURITY AUDIT**

Perform a thorough security review:

**Context:**
${JSON.stringify(context, null, 2)}

**Security Checklist:**

1. **Database Security**
   - All tables have RLS enabled?
   - Policies prevent privilege escalation?
   - No recursive policy issues?
   - Sensitive data encrypted/hashed?

2. **API Security**
   - Edge functions validate JWT properly?
   - Rate limiting implemented?
   - Input validation present?
   - SQL injection prevented?

3. **Authentication**
   - Session management secure?
   - Password requirements enforced?
   - MFA available for admin?
   - Auth state properly managed?

4. **Data Exposure**
   - PII properly protected?
   - Admin-only data isolated?
   - Payment info secured?
   - Logs don't leak secrets?

5. **Frontend Security**
   - XSS prevention in place?
   - CSRF tokens used?
   - Sensitive operations confirmed?
   - Admin routes protected?

Provide specific vulnerabilities found with PoC and fixes.`;
        break;
        
      case 'performance_audit':
        userPrompt = `**PERFORMANCE AUDIT**

Analyze application performance:

**Context:**
${JSON.stringify(context, null, 2)}

**Performance Areas:**

1. **Database Performance**
   - Slow queries and missing indexes
   - N+1 query problems
   - Unnecessary joins
   - Table scan issues

2. **Frontend Performance**
   - Component re-render issues
   - Large bundle sizes
   - Unoptimized images
   - Memory leaks

3. **API Performance**
   - Edge function cold starts
   - Inefficient data fetching
   - Missing caching
   - Slow external API calls

4. **Optimization Opportunities**
   - Code splitting possibilities
   - Lazy loading candidates
   - Memoization opportunities
   - Query optimization

Provide measurable improvements with benchmarks.`;
        break;
        
      default:
        userPrompt = `**CUSTOM ANALYSIS REQUEST**

User Query: ${context.query}

**Context:**
${JSON.stringify(context, null, 2)}

Analyze the above query thoroughly and provide:
1. Detailed findings with evidence
2. Root cause analysis if applicable
3. Specific code fixes with file paths
4. Implementation instructions
5. Testing recommendations`;
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
        temperature: 0.2,
        max_tokens: 8000,
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
