
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
      navigate('/admin/dashboard');
      return;
    }
    
    switch (role) {
      case 'customer':
        navigate('/customer/dashboard');
        break;
      case 'employee':
        navigate('/employee/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
    }
  }

  // Route protection logic
  useEffect(() => {
    // Skip protection checks if still loading auth state
    if (loading) {
      return;
    }
    
    const currentPath = location.pathname;
    
    // Handle public routes - always allow access
    const isPublicRoute = publicRoutes.some(route => 
      currentPath === route || currentPath.startsWith(route + '/')
    );
    
    if (isPublicRoute) {
      return;
    }
    
    // Handle authenticated users
    if (user) {
      // Special bypass for admin email on admin routes
      if (user.email === adminEmail && currentPath.startsWith('/admin')) {
        return;
      }
      
      // Allow customer routes for customers
      if (currentPath.startsWith('/customer') && (!userData || userData.role === 'customer')) {
        return;
      }
      
      // Allow employee routes for employees
      if (currentPath.startsWith('/employee') && (!userData || userData.role === 'employee')) {
        return;
      }
      
      // For users with profiles, check proper role access
      if (userData) {
        // Check if the user is trying to access a route they don't have permission for
        const isProtectedRoute = Object.entries(roleBasedRoutes).some(
          ([role, routes]) => 
            routes.some(route => currentPath.startsWith(route)) && 
            role !== userData.role && 
            !(role === 'admin' && isSuperAdmin)
        );
        
        if (isProtectedRoute) {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: `You don't have permission to access this section.`,
          });
          
          // Redirect based on user role
          redirectBasedOnRole(userData.role);
        }
      } 
    } 
    // Handle unauthenticated users trying to access protected routes
    else {
      const isAnyProtectedRoute = Object.values(roleBasedRoutes).flat().some(route => 
        currentPath.startsWith(route)
      );
      
      if (isAnyProtectedRoute) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to access this page.",
        });
        
        // Direct to appropriate login page based on the route
        if (currentPath.startsWith('/admin')) {
          navigate('/admin/login');
        } else if (currentPath.startsWith('/employee')) {
          navigate('/employee/login');
        } else {
          navigate('/customer/login');
        }
      }
    }
  }, [loading, user, userData, location.pathname, navigate, isSuperAdmin, adminEmail]);

  return { redirectBasedOnRole };
}
