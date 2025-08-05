
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimeTracker from "@/components/employee/TimeTracker";
import { JobAssignments } from "@/components/employee/JobAssignments";
import { RouteOptimizer } from "@/components/employee/RouteOptimizer";
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

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger value="time-tracker">Time Tracker</TabsTrigger>
        <TabsTrigger value="job-assignments">Job Assignments</TabsTrigger>
        <TabsTrigger value="route-optimizer">Route Optimizer</TabsTrigger>
      </TabsList>

      <TabsContent value="time-tracker">
        <TimeTracker />
      </TabsContent>

      <TabsContent value="job-assignments">
        <JobAssignments 
          assignments={assignments} 
          onViewRoute={handleViewRoute} 
          onMarkComplete={handleMarkComplete} 
        />
      </TabsContent>

      <TabsContent value="route-optimizer">
        <RouteOptimizer 
          selectedAssignment={selectedAssignment}
          currentLocation={currentLocation}
          onClose={handleCloseRoute}
        />
      </TabsContent>
    </Tabs>
  );
}
