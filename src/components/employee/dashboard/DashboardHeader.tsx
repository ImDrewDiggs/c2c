
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserData } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface DashboardHeaderProps {
  userData: UserData | null;
  user: User | null;
}

export function DashboardHeader({ userData, user }: DashboardHeaderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Employee Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome, {userData?.full_name || user?.email?.split('@')[0] || 'Employee'}!
        </p>
      </div>
    </div>
  );
}
