
import React, { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/integrations/supabase/client";
import Loading from "@/components/ui/Loading";

interface RequireAuthProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

/**
 * RequireAuth - Component to enforce role-based access control
 * 
 * This component ensures only users with specific roles can access protected components.
 * It checks authentication status and user role before allowing access.
 * If unauthorized access is detected, it redirects to the appropriate page.
 */
export function RequireAuth({ 
  children, 
  allowedRoles, 
  redirectTo = "/" 
}: RequireAuthProps) {
  const { user, userData, isAdmin, loading } = useAuth();
  const [accessVerified, setAccessVerified] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log('[RequireAuth] Auth state:', { 
      loading, 
      hasUser: !!user, 
      userEmail: user?.email,
      userData: userData ? { role: userData.role } : null,
      isAdmin,
      allowedRoles 
    });
    
    if (loading) {
      console.log('[RequireAuth] Still loading auth state...');
      return;
    }
    
    // Admin always has access
    if (isAdmin) {
      console.log('[RequireAuth] Admin access granted');
      setAccessVerified(true);
      return;
    }

    // No user, redirect to login
    if (!user) {
      console.log('[RequireAuth] No user found, redirecting to login');
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to access this page.",
      });
      
      // Determine appropriate login page
      if (redirectTo.startsWith('/admin')) {
        navigate('/admin/login', { replace: true });
      } else if (redirectTo.startsWith('/employee')) {
        navigate('/employee/login', { replace: true });
      } else {
        navigate('/customer/login', { replace: true });
      }
      return;
    }

    // Check if user role is allowed
    console.log('[RequireAuth] Checking user role access...', { 
      userRole: userData?.role, 
      allowedRoles,
      isAdminCheck: allowedRoles.includes('admin')
    });
    
    // Special handling for admin routes - if user is verified as admin by isAdmin flag, allow access
    if (allowedRoles.includes('admin') && isAdmin) {
      console.log('[RequireAuth] Admin access granted via isAdmin flag');
      setAccessVerified(true);
      return;
    }
    
    if (userData && allowedRoles.includes(userData.role)) {
      console.log('[RequireAuth] Role-based access granted');
      setAccessVerified(true);
    } else {
      console.log('[RequireAuth] Access denied - role not allowed');
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access this area",
      });
      navigate(redirectTo, { replace: true });
    }
  }, [user, userData, isAdmin, loading, allowedRoles, navigate, toast, redirectTo]);

  console.log('[RequireAuth] Render state:', { loading, accessVerified });

  if (loading || !accessVerified) {
    return <Loading fullscreen={true} size="medium" message="Verifying access..." />;
  }

  return <>{children}</>;
}
