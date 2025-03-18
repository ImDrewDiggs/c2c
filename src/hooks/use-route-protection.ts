
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole, UserData } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { RouteProtectionOptions } from '@/types/auth';

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

  // Log current route protection state
  useEffect(() => {
    console.log('[DIAGNOSTIC][RouteProtection] Route protection state:', {
      currentPath: location.pathname,
      isLoading: loading,
      hasUser: !!user,
      userEmail: user?.email,
      userDataExists: !!userData,
      userRole: userData?.role || 'none',
      isSuperAdmin
    });
  }, [location.pathname, loading, user, userData, isSuperAdmin]);

  // Function to redirect based on user role
  function redirectBasedOnRole(role: UserRole) {
    console.log('[DIAGNOSTIC][RouteProtection] Redirecting based on role:', role);
    switch (role) {
      case 'customer':
        navigate('/customer/dashboard');
        break;
      case 'employee':
        navigate('/employee/dashboard');
        break;
      case 'admin':
        console.log('[DIAGNOSTIC][RouteProtection] Redirecting admin to /admin/dashboard');
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
    }
  }

  // Route protection logic
  useEffect(() => {
    if (loading) {
      console.log('[DIAGNOSTIC][RouteProtection] Still loading, skipping route protection');
      return;
    }
    
    const currentPath = location.pathname;
    console.log('[DIAGNOSTIC][RouteProtection] Checking route protection for:', currentPath);
    
    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route => 
      currentPath === route || currentPath.startsWith(route + '/')
    );
    
    if (isPublicRoute) {
      console.log('[DIAGNOSTIC][RouteProtection] Current path is a public route, allowing access');
      return;
    }
    
    // Handle authenticated users
    if (user && userData) {
      console.log('[DIAGNOSTIC][RouteProtection] Authenticated user accessing route:', {
        route: currentPath,
        userRole: userData.role,
        isAdmin: userData.role === 'admin' || isSuperAdmin
      });
      
      // Check if the user is trying to access a route they don't have permission for
      const isProtectedRoute = Object.entries(roleBasedRoutes).some(
        ([role, routes]) => 
          routes.some(route => currentPath.startsWith(route)) && 
          role !== userData.role
      );
      
      if (isProtectedRoute) {
        console.log('[DIAGNOSTIC][RouteProtection] Unauthorized access attempt:', currentPath, 'by user with role:', userData.role);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: `You don't have permission to access this section.`,
        });
        
        // Redirect based on user role
        redirectBasedOnRole(userData.role);
      } else {
        console.log('[DIAGNOSTIC][RouteProtection] User has permission for this route');
      }
    } 
    // Handle unauthenticated users
    else if (!user) {
      console.log('[DIAGNOSTIC][RouteProtection] Unauthenticated user accessing route:', currentPath);
      
      // Check if the user is trying to access a protected route when not logged in
      const isAnyProtectedRoute = Object.values(roleBasedRoutes).flat().some(route => 
        currentPath.startsWith(route)
      );
      
      if (isAnyProtectedRoute) {
        console.log('[DIAGNOSTIC][RouteProtection] Redirecting unauthenticated user from protected route to login');
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to access this page.",
        });
        navigate('/customer/login');
      }
    }
  }, [loading, user, userData, location.pathname, navigate]);

  return { redirectBasedOnRole };
}
