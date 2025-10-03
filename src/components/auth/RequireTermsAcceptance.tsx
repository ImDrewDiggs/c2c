import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTermsAcceptance } from '@/hooks/useTermsAcceptance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RequireTermsAcceptanceProps {
  children: ReactNode;
}

export function RequireTermsAcceptance({ children }: RequireTermsAcceptanceProps) {
  const { hasAccepted, loading } = useTermsAcceptance();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !hasAccepted) {
      navigate('/terms');
    }
  }, [hasAccepted, loading, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccepted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <Lock className="h-12 w-12 mx-auto text-destructive mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You must accept our confidentiality agreement to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/terms')} className="w-full">
              Review and Accept Terms
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
