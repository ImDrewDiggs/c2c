
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

export default function EmployeeDashboard() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("time-tracker");
  
  // Use our custom hook to manage dashboard data and state
  const {
    assignments,
    loading,
    setLoading,
    selectedAssignment,
    setSelectedAssignment,
    currentLocation
  } = useEmployeeDashboard();

  useEffect(() => {
    // Check if the user is authenticated and has the employee role
    if (!user || userData?.role !== 'employee') {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in as an employee to access this dashboard.",
      });
      navigate("/employee/login");
    } else {
      setLoading(false);
    }
  }, [user, userData, navigate, toast, setLoading]);

  if (loading) {
    return <LoadingState />;
  }

  return (
    <ScrollArea className="h-[calc(100vh-64px)]">
      <div className="container mx-auto py-10 px-4 md:px-6">
        {/* Dashboard Header */}
        <DashboardHeader userData={userData} user={user} />
        
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
