
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { House, Assignment, EmployeeLocation } from "@/types/map";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { PickupsTable } from "@/components/admin/PickupsTable";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OperationsMap } from "@/components/admin/OperationsMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { QuickLinks } from "@/components/admin/QuickLinks";
import { EmployeeTracker } from "@/components/admin/EmployeeTracker";
import { useAuth } from "@/contexts/AuthContext";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { useToast } from "@/hooks/use-toast";
import { UserManagement } from "@/components/admin/UserManagement";
import { Loader2 } from "lucide-react";
import { HouseRow, AssignmentRow, EmployeeLocationRow } from "@/lib/supabase-types";

const mockRevenueData = [
  { name: "Mon", amount: 1200 },
  { name: "Tue", amount: 900 },
  { name: "Wed", amount: 1600 },
  { name: "Thu", amount: 1400 },
  { name: "Fri", amount: 2100 },
  { name: "Sat", amount: 800 },
  { name: "Sun", amount: 600 },
];

const mockPickups = [
  {
    id: 1,
    address: "123 Main St",
    status: "Pending",
    scheduledTime: "2:30 PM",
    assignedTo: "John Doe",
  },
  {
    id: 2,
    address: "456 Oak Ave",
    status: "Completed",
    scheduledTime: "3:45 PM",
    assignedTo: "Jane Smith",
  },
];

export default function AdminDashboard() {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [employeeLocations, setEmployeeLocations] = useState<EmployeeLocation[]>([]);
  const [activeEmployees, setActiveEmployees] = useState<number>(0);
  const { user, userData, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Check if user is admin with correct credentials
  useEffect(() => {
    if (userData) {
      if (userData.role !== 'admin') {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "You do not have permission to access the admin dashboard.",
        });
      }
      setLoading(false);
    }
  }, [userData, toast]);

  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => ({
      dailyPickups: 24,
      weeklyPickups: 168,
      monthlyPickups: 720,
      activeEmployees: 8,
      pendingPickups: 15,
      completedPickups: 9,
      todayRevenue: 2400,
    }),
  });

  const { data: houses = [] } = useQuery<House[]>({
    queryKey: ["houses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('houses')
        .select('*') as { data: HouseRow[] | null, error: any };
      
      if (error) throw error;
      
      return data?.map(house => ({
        id: house.id,
        address: house.address,
        latitude: house.latitude,
        longitude: house.longitude,
        created_at: house.created_at
      })) || [];
    },
  });

  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ["assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assignments')
        .select('*') as { data: AssignmentRow[] | null, error: any };
      
      if (error) throw error;
      
      return data?.map(assignment => ({
        id: assignment.id,
        house_id: assignment.house_id,
        employee_id: assignment.employee_id,
        status: assignment.status,
        assigned_date: assignment.assigned_date,
        completed_at: assignment.completed_at,
        created_at: assignment.created_at
      })) || [];
    },
  });

  // Subscribe to real-time employee location updates
  useEffect(() => {
    const channel = supabase
      .channel('employee-locations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employee_locations'
        },
        async (payload) => {
          console.log("Real-time location update received:", payload);
          
          const { data: locations, error } = await supabase
            .from('employee_locations')
            .select('*') as { data: EmployeeLocationRow[] | null, error: any };
          
          if (!error && locations) {
            const mappedLocations: EmployeeLocation[] = locations.map(loc => ({
              id: loc.id,
              employee_id: loc.employee_id,
              latitude: loc.latitude,
              longitude: loc.longitude,
              timestamp: loc.timestamp,
              is_online: loc.is_online,
              last_seen_at: loc.last_seen_at
            }));
            
            setEmployeeLocations(mappedLocations);
            setActiveEmployees(mappedLocations.filter(loc => loc.is_online).length);
          }
        }
      )
      .subscribe();

    // Initial fetch of employee locations
    const fetchEmployeeLocations = async () => {
      const { data: locations, error } = await supabase
        .from('employee_locations')
        .select('*') as { data: EmployeeLocationRow[] | null, error: any };
      
      if (!error && locations) {
        console.log("Initial employee locations loaded:", locations);
        
        const mappedLocations: EmployeeLocation[] = locations.map(loc => ({
          id: loc.id,
          employee_id: loc.employee_id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          timestamp: loc.timestamp,
          is_online: loc.is_online,
          last_seen_at: loc.last_seen_at
        }));
        
        setEmployeeLocations(mappedLocations);
        setActiveEmployees(mappedLocations.filter(loc => loc.is_online).length);
      }
    };

    fetchEmployeeLocations();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Get admin's location for map center
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to a central location if geolocation fails
          setCurrentLocation({
            latitude: 40.7128,
            longitude: -74.0060,
          });
        }
      );
    }
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userData?.role !== 'admin') {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p>You do not have permission to access the admin dashboard.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        {isSuperAdmin && (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Super Admin
          </div>
        )}
      </div>

      <StatsOverview 
        stats={stats || { dailyPickups: 0, pendingPickups: 0, todayRevenue: 0 }}
        activeEmployeesCount={activeEmployees}
      />

      <QuickLinks />

      <Tabs defaultValue="operations" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="employees">Employee Tracker</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PickupsTable pickups={mockPickups} />
            <RevenueChart data={mockRevenueData} />
          </div>

          <OperationsMap
            houses={houses}
            assignments={assignments}
            currentLocation={currentLocation}
            employeeLocations={employeeLocations}
          />
        </TabsContent>

        <TabsContent value="employees">
          <EmployeeTracker 
            employeeLocations={employeeLocations} 
            currentLocation={currentLocation}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement 
            superAdmin={isSuperAdmin} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
