import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import TimeTracker from "@/components/employee/TimeTracker";
import JobAssignments from "@/components/employee/JobAssignments";
import RouteOptimizer from "@/components/employee/RouteOptimizer";

export default function EmployeeDashboard() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("time-tracker");
  const [loading, setLoading] = useState(true);

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
            <TimeTracker employeeId={user.id} />
          </TabsContent>

          <TabsContent value="job-assignments">
            <JobAssignments employeeId={user.id} />
          </TabsContent>

          <TabsContent value="route-optimizer">
            <RouteOptimizer employeeId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
