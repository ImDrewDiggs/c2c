
import { useAuth } from "@/contexts/AuthContext";

interface DashboardHeaderProps {
  isSuperAdmin: boolean;
}

export function DashboardHeader({ isSuperAdmin }: DashboardHeaderProps) {
  const { user } = useAuth();
  const ADMIN_EMAIL = 'diggs844037@yahoo.com';
  
  // Determine admin status both from the prop and by checking email directly
  const isAdmin = isSuperAdmin || (user?.email === ADMIN_EMAIL);
  
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      {isAdmin && (
        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          Administrator
        </div>
      )}
    </div>
  );
}
