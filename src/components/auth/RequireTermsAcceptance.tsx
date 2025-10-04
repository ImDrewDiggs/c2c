import { ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useTermsAcceptance } from '@/hooks/useTermsAcceptance';

interface RequireTermsAcceptanceProps {
  children?: ReactNode;
}

export function RequireTermsAcceptance({ children }: RequireTermsAcceptanceProps) {
  const { hasAccepted, loading } = useTermsAcceptance();
  const location = useLocation();

  // Show loading spinner while checking acceptance
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Immediately redirect to terms page with return path if not accepted
  if (!hasAccepted) {
    const returnTo = encodeURIComponent(location.pathname);
    return <Navigate to={`/terms?redirect=${returnTo}`} replace />;
  }

  // Render children or outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
}
