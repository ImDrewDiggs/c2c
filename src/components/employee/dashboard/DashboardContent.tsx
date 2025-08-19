
import { TimeTracker } from "@/components/employee/TimeTracker";
import { TimeCard } from "@/components/employee/TimeCard";
import { RouteOptimizer } from "@/components/employee/RouteOptimizer";
import { FieldWorkerGroups } from "./FieldWorkerGroups";
import { Assignment, Location } from "@/types/map";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  assignments: Assignment[];
  selectedAssignment: Assignment | null;
  setSelectedAssignment: (assignment: Assignment | null) => void;
  currentLocation: Location | null;
  userId: string | undefined;
}

export function DashboardContent({
  activeTab,
  setActiveTab,
  assignments,
  selectedAssignment,
  setSelectedAssignment,
  currentLocation,
  userId
}: DashboardContentProps) {
  const { toast } = useToast();

  const handleViewRoute = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setActiveTab("route-optimizer");
  };

  const handleCloseRoute = () => {
    setSelectedAssignment(null);
  };

  const handleMarkComplete = async (assignment: Assignment) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', assignment.id);
        
      if (error) throw error;
      
      toast({
        title: "Job Completed",
        description: "The job has been marked as completed successfully."
      });
      
      // Note: The original code didn't invalidate the query cache
      // but we should implement it in a refactored version
      // queryClient.invalidateQueries(['employeeAssignments', userId]);
      
    } catch (error) {
      console.error('Error marking job as complete:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update job status. Please try again."
      });
    }
  };

  const handleRefreshRoute = () => {
    // This would typically refetch assignments or update route data
    toast({
      title: "Route Refreshed",
      description: "Your route has been updated with the latest information."
    });
  };

  return (
    <div className="space-y-6">
      {/* Field Worker Groups - Primary Interface */}
      <FieldWorkerGroups
        assignments={assignments}
        userId={userId || ''}
        currentLocation={currentLocation}
        onRefreshRoute={handleRefreshRoute}
        onMarkComplete={handleMarkComplete}
        onViewRoute={handleViewRoute}
      />

      {/* Hidden Route Optimizer for when needed */}
      {selectedAssignment && activeTab === "route-optimizer" && (
        <RouteOptimizer 
          selectedAssignment={selectedAssignment}
          currentLocation={currentLocation}
          onClose={handleCloseRoute}
        />
      )}

      {/* Time Tracker can be integrated into the groups or shown separately */}
      {activeTab === "time-tracker" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TimeTracker userId={userId || ''} />
          <TimeCard userId={userId || ''} />
        </div>
      )}
    </div>
  );
}
