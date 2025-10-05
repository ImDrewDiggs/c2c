
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole, UserData } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { RouteProtectionOptions } from '@/types/auth';

/**
 * SECURITY: No hardcoded admin credentials.
 * Admin checks are performed via RBAC system.
 */

export function useRouteProtection(
  loading: boolean,
  user: any,
  userData: UserData | null,
  isSuperAdmin: boolean,
  options: RouteProtectionOptions
) {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { publicRoutes, roleBasedRoutes } = options;

  // Function to redirect based on user role
  function redirectBasedOnRole(role: UserRole) {
    console.log('[RouteProtection] Redirecting based on role:', role);
    
    switch (role) {
      case 'customer':
        navigate('/customer/dashboard', { replace: true });
        break;
      case 'employee':
        navigate('/employee/dashboard', { replace: true });
        break;
      case 'admin':
        navigate('/admin/dashboard', { replace: true });
        break;
      default:
        navigate('/', { replace: true });
    }
  }

  // Route protection logic
  useEffect(() => {
    // Skip protection checks if still loading auth state
    if (loading) {
      console.log('[RouteProtection] Still loading auth state, skipping route protection');
      return;
    }
    
    const currentPath = location.pathname;
    console.log('[RouteProtection] Checking route protection for path:', currentPath);
    
    // Handle public routes - always allow access
    const isPublicRoute = publicRoutes.some(route => 
      currentPath === route || currentPath.startsWith(route + '/')
    );
    
    if (isPublicRoute) {
      console.log('[RouteProtection] Public route, allowing access');
      return;
    }
    
    // Handle authenticated users
    if (user) {
      console.log('[RouteProtection] User is authenticated, checking role-based access');
      
      // Check for specific role paths
      const isCustomerRoute = currentPath.startsWith('/customer');
      const isEmployeeRoute = currentPath.startsWith('/employee');
      const isAdminRoute = currentPath.startsWith('/admin');
      
      // Only allow access if the role matches or user is admin
      if (isCustomerRoute && (userData?.role === 'customer' || userData?.role === 'admin' || isSuperAdmin)) {
        console.log('[RouteProtection] Customer route access allowed');
        return;
      }
      
      if (isEmployeeRoute && (userData?.role === 'employee' || userData?.role === 'admin' || isSuperAdmin)) {
        console.log('[RouteProtection] Employee route access allowed');
        return;
      }
      
      if (isAdminRoute && (userData?.role === 'admin' || isSuperAdmin)) {
        console.log('[RouteProtection] Admin route access allowed');
        return;
      }
      
      // Unauthorized access attempt
      console.log('[RouteProtection] Unauthorized access attempt detected');
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access this area",
      });
      
      // Redirect to the appropriate dashboard based on role
      if (userData?.role) {
        redirectBasedOnRole(userData.role);
      } else {
        // If no role, redirect to home
        navigate('/', { replace: true });
      }
    } else {
      // Handle unauthenticated users trying to access protected routes
      const isAnyProtectedRoute = Object.values(roleBasedRoutes).flat().some(route => 
        currentPath.startsWith(route)
      );
      
      if (isAnyProtectedRoute) {
        console.log('[RouteProtection] Unauthenticated user attempting to access protected route, redirecting to login');
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to access this page.",
        });
        
        // Direct to appropriate login page based on the route
        if (currentPath.startsWith('/admin')) {
          navigate('/admin/login', { replace: true });
        } else if (currentPath.startsWith('/employee')) {
          navigate('/employee/login', { replace: true });
        } else {
          navigate('/customer/login', { replace: true });
        }
      }
    }
  }, [loading, user, userData, location.pathname, navigate, isSuperAdmin, toast]);

  return { redirectBasedOnRole };
}
