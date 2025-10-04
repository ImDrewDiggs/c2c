import { ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useTermsAcceptance } from '@/hooks/useTermsAcceptance';
import { useAuth } from '@/contexts/AuthContext';

interface RequireTermsAcceptanceProps {
  children?: ReactNode;
}

export function RequireTermsAcceptance({ children }: RequireTermsAcceptanceProps) {
  const { user, loading: authLoading } = useAuth();
  const { hasAccepted, loading: termsLoading } = useTermsAcceptance();
  const location = useLocation();

  // Show loading spinner while checking auth and acceptance
  if (authLoading || termsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // First check: user must be authenticated to see pricing
  if (!user) {
    const returnTo = encodeURIComponent(location.pathname);
    return <Navigate to={`/customer/register?redirect=${returnTo}`} replace />;
  }

  // Second check: authenticated user must accept NDA
  if (!hasAccepted) {
    const returnTo = encodeURIComponent(location.pathname);
    return <Navigate to={`/terms?redirect=${returnTo}`} replace />;
  }

  // Render children or outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
}
