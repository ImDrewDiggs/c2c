
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ReactNode, useEffect } from "react";

interface AdminAccessCheckProps {
  children: ReactNode;
  adminEmail: string;
}

export function AdminAccessCheck({ children, adminEmail }: AdminAccessCheckProps) {
  const { user, userData, isSuperAdmin, loading: authLoading } = useAuth();
  
  // Log key information for debugging
  useEffect(() => {
    console.log('[AdminAccessCheck] Checking admin access:', {
      userEmail: user?.email,
      adminEmail: adminEmail,
      hasUserData: !!userData,
      isSuperAdmin: isSuperAdmin,
      loading: authLoading
    });
  }, [user, userData, isSuperAdmin, authLoading, adminEmail]);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading admin dashboard...</span>
      </div>
    );
  }

  // First priority check: Is this the admin email?
  if (user?.email === adminEmail) {
    console.log('[AdminAccessCheck] Admin access granted based on email match');
    return <>{children}</>;
  }

  // Second priority: Check userData and isSuperAdmin
  if (!userData || (userData.role !== 'admin' && !isSuperAdmin)) {
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

  console.log('[AdminAccessCheck] Access granted based on role or isSuperAdmin flag');
  return <>{children}</>;
}
