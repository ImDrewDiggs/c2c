
import React, { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AdminAccessCheckProps {
  children: ReactNode;
}

export function AdminAccessCheck({ children }: AdminAccessCheckProps) {
  const { user, userData, isSuperAdmin, loading } = useAuth();
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
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You must be logged in to view this page",
        });
        navigate("/admin/login");
      } else if (!isSuperAdmin && (!userData || userData.role !== "admin")) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You do not have admin privileges",
        });
        navigate("/");
      }
    }
  }, [user, userData, isSuperAdmin, loading, navigate, toast]);

  // Show loading state while checking authentication
  if (loading) {
    return <div className="p-8 text-center">Verifying access...</div>;
  }

  // Only render children if we have an admin user
  return (isSuperAdmin || (userData && userData.role === "admin")) ? (
    <>{children}</>
  ) : null;
}
