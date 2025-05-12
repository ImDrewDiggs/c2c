
import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEmployeeDashboard } from "@/hooks/useEmployeeDashboard";
import { QuickActions } from "@/components/employee/dashboard/QuickActions";
import { DashboardHeader } from "@/components/employee/dashboard/DashboardHeader";
import { DashboardContent } from "@/components/employee/dashboard/DashboardContent";
import { LoadingState } from "@/components/employee/dashboard/LoadingState";
import { LogoutButton } from "@/components/LogoutButton";
import { AuthService } from '@/services/AuthService';

export default function EmployeeDashboard() {
  const { user, userData, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("time-tracker");
  const [accessVerified, setAccessVerified] = useState(false);
  
  // Use our custom hook to manage dashboard data and state
  const {
    assignments,
    loading,
    setLoading,
    selectedAssignment,
    setSelectedAssignment,
    currentLocation
  } = useEmployeeDashboard();

  // Verify proper role access
  useEffect(() => {
    const verifyAccess = async () => {
      // Admin always has access
      if (isSuperAdmin || (userData?.role === 'admin')) {
        setAccessVerified(true);
        setLoading(false);
        return;
      }
      
      // Check if user is an employee
      if (!user || userData?.role !== 'employee') {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You must be logged in as an employee to access this dashboard.",
        });
        navigate("/employee/login");
        return;
      }
      
      setAccessVerified(true);
      setLoading(false);
    };
    
    verifyAccess();
  }, [user, userData, navigate, toast, setLoading, isSuperAdmin]);

  if (loading || !accessVerified) {
    return <LoadingState message="Verifying access..." />;
  }

  return (
    <ScrollArea className="h-[calc(100vh-64px)]">
      <div className="container mx-auto py-10 px-4 md:px-6">
        {/* Dashboard Header with Logout button */}
        <div className="flex justify-between items-center mb-6">
          <DashboardHeader userData={userData} user={user} />
          <LogoutButton />
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
  );
}
