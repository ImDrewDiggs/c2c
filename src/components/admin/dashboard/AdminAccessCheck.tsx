
import React, { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AdminAccessCheckProps {
  children: ReactNode;
}

export function AdminAccessCheck({ children }: AdminAccessCheckProps) {
  const { user, userData, isSuperAdmin, loading } = useAuth();
  const [accessChecked, setAccessChecked] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Only check after loading is complete
    if (!loading) {
      console.log("[AdminAccessCheck] Checking admin access:", {
        hasUser: !!user,
        hasUserData: !!userData,
        userRole: userData?.role,
        isSuperAdmin,
      });

      if (!user) {
        console.log("[AdminAccessCheck] No user found, redirecting to login");
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You must be logged in to view this page",
        });
        navigate("/admin/login");
        return;
      }
      
      if (!isSuperAdmin && (!userData || userData.role !== "admin")) {
        console.log("[AdminAccessCheck] User is not admin, redirecting to home");
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You do not have admin privileges",
        });
        navigate("/");
        return;
      }
      
      // Access check completed successfully
      setAccessChecked(true);
    }
  }, [user, userData, isSuperAdmin, loading, navigate, toast]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }
  
  // If not loading but access check hasn't completed, show a brief loading screen
  if (!accessChecked) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Preparing dashboard...</p>
      </div>
    );
  }

  // Only render children if we have an admin user
  return (isSuperAdmin || (userData && userData.role === "admin")) ? (
    <>{children}</>
  ) : null;
}
