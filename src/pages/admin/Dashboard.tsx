
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { House, Assignment, EmployeeLocation } from "@/types/map";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { PickupsTable } from "@/components/admin/PickupsTable";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OperationsMap } from "@/components/admin/OperationsMap";

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
        .from("houses")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ["assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*");
      if (error) throw error;
      return data;
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
          const { data: locations, error } = await supabase
            .from('employee_locations')
            .select('*')
            .eq('is_online', true);
          
          if (!error && locations) {
            setEmployeeLocations(locations);
          }
        }
      )
      .subscribe();

    // Initial fetch of employee locations
    const fetchEmployeeLocations = async () => {
      const { data: locations, error } = await supabase
        .from('employee_locations')
        .select('*')
        .eq('is_online', true);
      
      if (!error && locations) {
        setEmployeeLocations(locations);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <StatsOverview 
        stats={stats || { dailyPickups: 0, pendingPickups: 0, todayRevenue: 0 }}
        activeEmployeesCount={employeeLocations.length}
      />

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
    </div>
  );
}
