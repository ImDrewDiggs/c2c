
import React, { ReactNode, useEffect, useState, useRef } from "react";
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
  const [checkingAccess, setCheckingAccess] = useState(true);
  const accessCheckAttempted = useRef(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Clear checking state if taking too long
  useEffect(() => {
    if (!loading && user && (isSuperAdmin || (userData && userData.role === "admin"))) {
      setCheckingAccess(false);
      setAccessChecked(true);
    }
  }, [loading, user, userData, isSuperAdmin]);

  useEffect(() => {
    // Prevent redundant access checks
    if (accessChecked || accessCheckAttempted.current) return;
    
    // Only check after loading is complete
    if (!loading) {
      accessCheckAttempted.current = true;
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
        navigate("/admin/login", { replace: true });
        return;
      }
      
      if (!isSuperAdmin && (!userData || userData.role !== "admin")) {
        console.log("[AdminAccessCheck] User is not admin, redirecting to home");
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You do not have admin privileges",
        });
        navigate("/", { replace: true });
        return;
      }
      
      // Access check completed successfully
      setAccessChecked(true);
      setCheckingAccess(false);
    }
  }, [user, userData, isSuperAdmin, loading, navigate, toast, accessChecked]);

  // Add a timeout to prevent indefinite loading state
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (checkingAccess && accessCheckAttempted.current) {
        console.log("[AdminAccessCheck] Access check timed out, assuming failure");
        setCheckingAccess(false);
        navigate("/admin/login", { replace: true });
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Could not verify your credentials. Please log in again.",
        });
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeoutId);
  }, [checkingAccess, navigate, toast]);

  // Show loading state while checking authentication
  if (loading || checkingAccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">
          {loading ? "Verifying access..." : "Preparing dashboard..."}
        </p>
      </div>
    );
  }

  // Only render children if we have an admin user
  return (isSuperAdmin || (userData && userData.role === "admin")) ? (
    <>{children}</>
  ) : null;
}
