import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Lock, Unlock, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface EndpointDoc {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  auth: boolean;
  requestBody?: Record<string, unknown>;
  responseExample?: Record<string, unknown>;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
}

const edgeFunctions: EndpointDoc[] = [
  {
    name: 'Accept Terms',
    method: 'POST',
    path: '/functions/v1/accept-terms',
    description: 'Records user acceptance of terms and conditions with metadata.',
    auth: false,
    requestBody: {
      session_id: 'string (optional)',
      user_agent: 'string',
      referer: 'string'
    },
    responseExample: {
      success: true,
      acceptance_id: 'uuid'
    }
  },
  {
    name: 'Admin Create Employee',
    method: 'POST',
    path: '/functions/v1/admin-create-employee',
    description: 'Creates a new employee account with role assignment. Requires admin privileges.',
    auth: true,
    requestBody: {
      email: 'string',
      password: 'string',
      full_name: 'string',
      phone: 'string (optional)',
      job_title: 'string (optional)',
      pay_rate: 'number (optional)'
    },
    responseExample: {
      success: true,
      user: { id: 'uuid', email: 'string' }
    }
  },
  {
    name: 'Admin Delete User',
    method: 'DELETE',
    path: '/functions/v1/admin-delete-user',
    description: 'Permanently deletes a user account and associated data. Requires admin privileges.',
    auth: true,
    requestBody: {
      user_id: 'uuid'
    },
    responseExample: {
      success: true,
      message: 'User deleted successfully'
    }
  },
  {
    name: 'Check Subscription',
    method: 'POST',
    path: '/functions/v1/check-subscription',
    description: 'Verifies user subscription status and plan details.',
    auth: true,
    responseExample: {
      subscribed: true,
      plan: 'premium',
      expires_at: 'ISO date string'
    }
  },
  {
    name: 'Create Checkout Session',
    method: 'POST',
    path: '/functions/v1/create-checkout-session',
    description: 'Creates a Stripe checkout session for subscription or one-time payments.',
    auth: true,
    requestBody: {
      plan_type: 'string',
      billing_cycle: 'monthly | yearly',
      success_url: 'string',
      cancel_url: 'string'
    },
    responseExample: {
      session_id: 'cs_xxx',
      url: 'https://checkout.stripe.com/...'
    }
  },
  {
    name: 'Customer Portal',
    method: 'POST',
    path: '/functions/v1/customer-portal',
    description: 'Creates a Stripe customer portal session for subscription management.',
    auth: true,
    responseExample: {
      url: 'https://billing.stripe.com/...'
    }
  },
  {
    name: 'Secure Admin Management',
    method: 'POST',
    path: '/functions/v1/secure-admin-management',
    description: 'Administrative operations for user and role management. Requires super_admin privileges.',
    auth: true,
    requestBody: {
      action: 'create_admin | update_role | disable_user',
      target_user_id: 'uuid (optional)',
      role: 'admin | super_admin (optional)',
      email: 'string (optional)'
    },
    responseExample: {
      success: true,
      result: {}
    }
  },
  {
    name: 'Verify Payment',
    method: 'POST',
    path: '/functions/v1/verify-payment',
    description: 'Verifies payment completion and updates order/subscription status.',
    auth: true,
    requestBody: {
      session_id: 'string',
      order_id: 'uuid (optional)'
    },
    responseExample: {
      verified: true,
      order: { id: 'uuid', status: 'paid' }
    }
  }
];

const methodColors: Record<string, string> = {
  GET: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30',
  POST: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  PUT: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  DELETE: 'bg-red-500/20 text-red-600 border-red-500/30',
  PATCH: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
};

function EndpointCard({ endpoint }: { endpoint: EndpointDoc }) {
  const [isOpen, setIsOpen] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="mb-4">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <Badge className={methodColors[endpoint.method]} variant="outline">
                  {endpoint.method}
                </Badge>
                <code className="text-sm font-mono text-muted-foreground">{endpoint.path}</code>
                {endpoint.auth ? (
                  <Lock className="h-4 w-4 text-amber-500" />
                ) : (
                  <Unlock className="h-4 w-4 text-emerald-500" />
                )}
              </div>
              <CardTitle className="text-sm font-medium">{endpoint.name}</CardTitle>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <CardDescription className="mb-4">{endpoint.description}</CardDescription>

            <Tabs defaultValue="request" className="w-full">
              <TabsList className="mb-4">
                {endpoint.requestBody && <TabsTrigger value="request">Request Body</TabsTrigger>}
                <TabsTrigger value="response">Response</TabsTrigger>
                {endpoint.parameters && <TabsTrigger value="params">Parameters</TabsTrigger>}
              </TabsList>

              {endpoint.requestBody && (
                <TabsContent value="request">
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify(endpoint.requestBody, null, 2)}
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(JSON.stringify(endpoint.requestBody, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              )}

              <TabsContent value="response">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(endpoint.responseExample, null, 2)}
                  </pre>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(JSON.stringify(endpoint.responseExample, null, 2))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              {endpoint.parameters && (
                <TabsContent value="params">
                  <div className="space-y-2">
                    {endpoint.parameters.map((param) => (
                      <div key={param.name} className="flex items-start gap-4 p-3 bg-muted rounded-lg">
                        <code className="text-sm font-mono font-semibold">{param.name}</code>
                        <Badge variant="outline">{param.type}</Badge>
                        {param.required && <Badge variant="destructive">Required</Badge>}
                        <span className="text-sm text-muted-foreground">{param.description}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function ApiDocs() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Documentation</h1>
            <p className="text-muted-foreground mt-2">
              Complete reference for all Supabase Edge Functions
            </p>
          </div>
          <Button variant="outline" asChild>
            <a href="https://supabase.com/docs/guides/functions" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Supabase Docs
            </a>
          </Button>
        </div>

        <div className="flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-500" />
            Requires Authentication
          </div>
          <div className="flex items-center gap-2">
            <Unlock className="h-4 w-4 text-emerald-500" />
            Public Endpoint
          </div>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Base URL</CardTitle>
          <CardDescription>All API endpoints are relative to this base URL</CardDescription>
        </CardHeader>
        <CardContent>
          <code className="bg-muted px-4 py-2 rounded-lg block text-sm">
            https://&lt;project-ref&gt;.supabase.co
          </code>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Authentication</CardTitle>
          <CardDescription>How to authenticate API requests</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`// Include the Authorization header with your Supabase session token
fetch('/functions/v1/endpoint', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${supabase.auth.session()?.access_token}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ /* request body */ })
})`}
          </pre>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Edge Functions</h2>
      
      <div className="space-y-4">
        {edgeFunctions.map((endpoint) => (
          <EndpointCard key={endpoint.path} endpoint={endpoint} />
        ))}
      </div>
    </div>
  );
}
