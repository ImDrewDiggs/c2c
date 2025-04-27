
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ReactNode, useEffect } from "react";
import { AuthService } from "@/services/AuthService";

interface AdminAccessCheckProps {
  children: ReactNode;
  adminEmail?: string; // Make this optional
}

export function AdminAccessCheck({ children, adminEmail }: AdminAccessCheckProps) {
  const { user, userData, isSuperAdmin, loading: authLoading } = useAuth();
  // Use provided adminEmail or fall back to the static property
  const adminEmailToCheck = adminEmail || AuthService.ADMIN_EMAIL;
  
  // Log key information for debugging
  useEffect(() => {
    console.log('[AdminAccessCheck] Checking admin access:', {
      userEmail: user?.email,
      adminEmail: adminEmailToCheck,
      hasUserData: !!userData,
      isSuperAdmin: isSuperAdmin,
      loading: authLoading
    });
  }, [user, userData, isSuperAdmin, authLoading, adminEmailToCheck]);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading admin dashboard...</span>
      </div>
    );
  }

  // First priority check: Is this the admin email?
  if (user?.email === adminEmailToCheck) {
    console.log('[AdminAccessCheck] Admin access granted based on email match');
    return <>{children}</>;
  }

  // Second priority: Check userData and isSuperAdmin
  if (isSuperAdmin || (userData?.role === 'admin')) {
    console.log('[AdminAccessCheck] Access granted based on role or isSuperAdmin flag');
    return <>{children}</>;
  }

  console.log('[AdminAccessCheck] Access denied: Not an admin user');
  return (
    <div className="container mx-auto p-6">
      <Card className="p-8 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
        <p>You do not have permission to access the admin dashboard.</p>
      </Card>
    </div>
  );
}
