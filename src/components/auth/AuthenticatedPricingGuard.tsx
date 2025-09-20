import { useAuthState } from "@/hooks/use-auth-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Shield } from "lucide-react";
import { Link } from "react-router-dom";

interface AuthenticatedPricingGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthenticatedPricingGuard({ children, fallback }: AuthenticatedPricingGuardProps) {
  const { user, loading } = useAuthState();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
          <CardTitle className="flex items-center gap-2 justify-center">
            <Lock className="h-5 w-5" />
            Detailed Pricing Protected
          </CardTitle>
          <CardDescription>
            Access to detailed pricing information requires authentication to protect our business data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            <p>Sign in to view:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Exact pricing details</li>
              <li>Competitive analysis</li>
              <li>Full service features</li>
              <li>Custom quote options</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link to="/auth/customer-login">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/auth/customer-register">Register</Link>
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Basic service information is available to all visitors
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}