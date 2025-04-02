
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import TimeTracker from "@/components/employee/TimeTracker";
import { JobAssignments } from "@/components/employee/JobAssignments";
import { RouteOptimizer } from "@/components/employee/RouteOptimizer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { HouseRow, AssignmentRow } from "@/lib/supabase-types";
import { Assignment, House, Location } from "@/types/map";

export default function EmployeeDashboard() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("time-tracker");
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  // Fetch current employee location
  useEffect(() => {
    if (user?.id) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Set a default location if geolocation fails
          setCurrentLocation({ latitude: 40.7128, longitude: -74.0060 }); // Default to NYC
        }
      );
    }
  }, [user?.id]);

  // Fetch employee's assignments
  const { data: assignments = [] } = useQuery({
    queryKey: ['employeeAssignments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: assignmentsData, error } = await supabase
        .from('assignments')
        .select(`
          *,
          house:houses(*)
        `)
        .eq('employee_id', user.id);
        
      if (error) throw error;
      
      return assignmentsData.map(assignment => ({
        id: assignment.id,
        house_id: assignment.house_id,
        employee_id: assignment.employee_id,
        status: assignment.status,
        assigned_date: assignment.assigned_date,
        completed_at: assignment.completed_at,
        house: assignment.house as House
      })) as Assignment[];
    },
    enabled: !!user?.id,
  });

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
  }, [user, userData, navigate, toast]);

  const handleViewRoute = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setActiveTab("route-optimizer");
  };

  const handleCloseRoute = () => {
    setSelectedAssignment(null);
  };

  const handleMarkComplete = async (assignment: Assignment) => {
    if (!user?.id) return;
    
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
      
      // Refresh assignments
      // Note: In a real app with React Query, we would invalidate the query instead
    } catch (error) {
      console.error('Error marking job as complete:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update job status. Please try again."
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Employee Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {userData?.full_name || user?.email?.split('@')[0] || 'Employee'}!
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your tasks and track your time</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button
              onClick={() => setActiveTab("time-tracker")}
              variant={activeTab === "time-tracker" ? "default" : "outline"}
            >
              Time Tracker
            </Button>
            <Button
              onClick={() => setActiveTab("job-assignments")}
              variant={activeTab === "job-assignments" ? "default" : "outline"}
            >
              Job Assignments
            </Button>
            <Button
              onClick={() => setActiveTab("route-optimizer")}
              variant={activeTab === "route-optimizer" ? "default" : "outline"}
            >
              Route Optimizer
            </Button>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}
