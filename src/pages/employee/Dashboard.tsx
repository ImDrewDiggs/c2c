
import { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEmployeeDashboard } from "@/hooks/useEmployeeDashboard";
import { QuickActions } from "@/components/employee/dashboard/QuickActions";
import { DashboardHeader } from "@/components/employee/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/employee/dashboard/DashboardContent";
import { LogoutButton } from "@/components/LogoutButton";
import { ChangePasswordModal } from "@/components/auth/ChangePasswordModal";

export default function EmployeeDashboard() {
  const { user, userData } = useAuth();
  const [activeTab, setActiveTab] = useState("time-tracker");
  
  // Use our custom hook to manage dashboard data and state
  const {
    assignments,
    loading,
    selectedAssignment,
    setSelectedAssignment,
    currentLocation
  } = useEmployeeDashboard();

  return (
    <RequireAuth allowedRoles={['employee']} redirectTo="/employee/login">
      <ScrollArea className="h-[calc(100vh-64px)]">
        <div className="container mx-auto py-10 px-4 md:px-6">
          {/* Dashboard Header with Logout button */}
          <div className="flex justify-between items-center mb-6">
            <DashboardHeader userData={userData} user={user} />
            <div className="flex items-center gap-3">
              <ChangePasswordModal />
              <LogoutButton />
            </div>
          </div>
          
          <div className="space-y-6 mt-6">
            {/* Quick Actions */}
            <QuickActions activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {/* Main Dashboard Content */}
            <DashboardContent
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              assignments={assignments}
              selectedAssignment={selectedAssignment}
              setSelectedAssignment={setSelectedAssignment}
              currentLocation={currentLocation}
              userId={user?.id}
            />
          </div>
        </div>
      </ScrollArea>
    </RequireAuth>
  );
}
