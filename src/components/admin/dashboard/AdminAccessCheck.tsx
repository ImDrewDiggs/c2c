
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface AdminAccessCheckProps {
  children: ReactNode;
  adminEmail: string;
}

export function AdminAccessCheck({ children, adminEmail }: AdminAccessCheckProps) {
  const { user, userData, isSuperAdmin, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading admin dashboard...</span>
      </div>
    );
  }

  if (user?.email === adminEmail) {
    return <>{children}</>;
  }

  if (!userData || (userData.role !== 'admin' && !isSuperAdmin)) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p>You do not have permission to access the admin dashboard.</p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
