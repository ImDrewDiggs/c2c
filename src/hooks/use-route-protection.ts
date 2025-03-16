
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

  // Function to redirect based on user role
  function redirectBasedOnRole(role: UserRole) {
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
    if (loading) return;
    
    const currentPath = location.pathname;
    
    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route => 
      currentPath === route || currentPath.startsWith(route + '/')
    );
    
    if (isPublicRoute) {
      // Public routes are always accessible
      return;
    }
    
    // Handle authenticated users
    if (user && userData) {
      // Check if the user is trying to access a route they don't have permission for
      const isProtectedRoute = Object.entries(roleBasedRoutes).some(
        ([role, routes]) => 
          routes.some(route => currentPath.startsWith(route)) && 
          role !== userData.role
      );
      
      if (isProtectedRoute) {
        console.log('Unauthorized access attempt:', currentPath, 'by user with role:', userData.role);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: `You don't have permission to access this section.`,
        });
        
        // Redirect based on user role
        redirectBasedOnRole(userData.role);
      }
    } 
    // Handle unauthenticated users
    else if (!user) {
      // Check if the user is trying to access a protected route when not logged in
      const isAnyProtectedRoute = Object.values(roleBasedRoutes).flat().some(route => 
        currentPath.startsWith(route)
      );
      
      if (isAnyProtectedRoute) {
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
