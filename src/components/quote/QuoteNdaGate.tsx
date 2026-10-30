import { Link, useLocation } from "react-router-dom";
import { Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuoteNdaGateProps {
  /** True when the visitor is signed in but has not accepted the NDA yet. */
  signedIn: boolean;
}

/**
 * Shown in place of plan tiers / prices until the visitor is signed in
 * and has accepted the Confidentiality Agreement (NDA).
 * Quote progress is autosaved, so they resume here after returning.
 */
export function QuoteNdaGate({ signedIn }: QuoteNdaGateProps) {
  const location = useLocation();
  const returnTo = encodeURIComponent(`${location.pathname}${location.search}`);
  const href = signedIn
    ? `/terms?redirect=${returnTo}`
    : `/customer/register?redirect=${returnTo}`;

  return (
    <div className="text-center space-y-4 py-4">
      <Shield className="h-10 w-10 mx-auto text-primary" aria-hidden="true" />
      <h2 className="text-xl font-semibold flex items-center justify-center gap-2">
        <Lock className="h-4 w-4" aria-hidden="true" />
        Pricing is protected
      </h2>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        {signedIn
          ? "Please review and accept our Confidentiality Agreement to see plans and pricing. Your progress is saved."
          : "Create a free account and accept our Confidentiality Agreement to see plans and pricing. Your progress is saved."}
      </p>
      <Button asChild>
        <Link to={href}>{signedIn ? "Review agreement" : "Create account"}</Link>
      </Button>
      {!signedIn && (
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to={`/customer/login?redirect=${returnTo}`} className="text-primary underline">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
