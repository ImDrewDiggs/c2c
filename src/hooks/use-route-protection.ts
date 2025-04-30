
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
  const { publicRoutes, roleBasedRoutes, adminEmail } = options;

  // Function to redirect based on user role
  function redirectBasedOnRole(role: UserRole) {
    console.log('[RouteProtection] Redirecting based on role:', role);
    
    // Special case for admin email
    if (user?.email === adminEmail) {
      console.log('[RouteProtection] Redirecting admin user to /admin/dashboard');
      navigate('/admin/dashboard', { replace: true });
      return;
    }
    
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
      
      // Special bypass for admin email on admin routes
      if (user.email === adminEmail && currentPath.startsWith('/admin')) {
        console.log('[RouteProtection] Admin email on admin route, allowing access');
        return;
      }
      
      // Allow customer routes for customers
      if (currentPath.startsWith('/customer') && (!userData || userData.role === 'customer')) {
        console.log('[RouteProtection] Customer on customer route, allowing access');
        return;
      }
      
      // Allow employee routes for employees
      if (currentPath.startsWith('/employee') && (!userData || userData.role === 'employee')) {
        console.log('[RouteProtection] Employee on employee route, allowing access');
        return;
      }
      
      // For users with profiles, check proper role access
      if (userData) {
        console.log('[RouteProtection] Checking role-based access for user with role:', userData.role);
        
        // Check if the user is trying to access a route they don't have permission for
        const isProtectedRoute = Object.entries(roleBasedRoutes).some(
          ([role, routes]) => 
            routes.some(route => currentPath.startsWith(route)) && 
            role !== userData.role && 
            !(role === 'admin' && isSuperAdmin)
        );
        
        if (isProtectedRoute) {
          console.log('[RouteProtection] User attempting to access unauthorized route, redirecting');
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: `You don't have permission to access this section.`,
          });
          
          // Redirect based on user role
          redirectBasedOnRole(userData.role);
        } else {
          console.log('[RouteProtection] User has proper role access, allowing');
        }
      } 
    } 
    // Handle unauthenticated users trying to access protected routes
    else {
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
  }, [loading, user, userData, location.pathname, navigate, isSuperAdmin, adminEmail, toast]);

  return { redirectBasedOnRole };
}
