
import React, { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/supabase";
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
    if (loading) return;
    
    // Admin always has access
    if (isAdmin) {
      setAccessVerified(true);
      return;
    }

    // No user, redirect to login
    if (!user) {
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
    if (userData && allowedRoles.includes(userData.role)) {
      setAccessVerified(true);
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access this area",
      });
      navigate(redirectTo, { replace: true });
    }
  }, [user, userData, isAdmin, loading, allowedRoles, navigate, toast, redirectTo]);

  if (loading || !accessVerified) {
    return <Loading fullscreen={true} size="medium" message="Verifying access..." />;
  }

  return <>{children}</>;
}
