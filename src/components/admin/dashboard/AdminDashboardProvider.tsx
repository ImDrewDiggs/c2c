
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, ReactNode, createContext, useContext, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { House, Assignment, EmployeeLocation } from "@/types/map";
import { EmployeeLocationRow, HouseRow, AssignmentRow } from "@/lib/supabase-types";

// Define the dashboard context value type
interface AdminDashboardContextValue {
  stats: {
    dailyPickups: number;
    weeklyPickups: number;
    monthlyPickups: number;
    activeEmployees: number;
    pendingPickups: number;
    completedPickups: number;
    todayRevenue: number;
  };
  houses: House[];
  assignments: Assignment[];
  currentLocation: { latitude: number; longitude: number } | null;
  employeeLocations: EmployeeLocation[];
  activeEmployees: number;
  mockRevenueData: { name: string; amount: number }[];
  mockPickups: { id: number; address: string; status: string; scheduledTime: string; assignedTo: string }[];
}

// Create context with a proper initial value
const AdminDashboardContext = createContext<AdminDashboardContextValue>({
  stats: {
    dailyPickups: 0,
    weeklyPickups: 0,
    monthlyPickups: 0,
    activeEmployees: 0,
    pendingPickups: 0,
    completedPickups: 0,
    todayRevenue: 0,
  },
  houses: [],
  assignments: [],
  currentLocation: null,
  employeeLocations: [],
  activeEmployees: 0,
  mockRevenueData: [],
  mockPickups: [],
});

// Hook to use the dashboard context
export function useAdminDashboard() {
  const context = useContext(AdminDashboardContext);
  if (context === undefined) {
    throw new Error("useAdminDashboard must be used within an AdminDashboardProvider");
  }
  return context;
}

// Props for the provider component
interface AdminDashboardProviderProps {
  children: ReactNode;
}

// Dashboard Provider Component
export function AdminDashboardProvider({ children }: AdminDashboardProviderProps) {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [employeeLocations, setEmployeeLocations] = useState<EmployeeLocation[]>([]);
  const [activeEmployees, setActiveEmployees] = useState<number>(0);

  // Mock data for the charts
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

  // Query for dashboard stats
  const { data: stats = {
    dailyPickups: 24,
    weeklyPickups: 168,
    monthlyPickups: 720,
    activeEmployees: 8,
    pendingPickups: 15,
    completedPickups: 9,
    todayRevenue: 2400,
  }} = useQuery({
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

  // Query for houses data
  const { data: houses = [] } = useQuery<House[]>({
    queryKey: ["houses"],
    queryFn: async () => {
      try {
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
      } catch (error) {
        console.error("Error fetching houses:", error);
        return [];
      }
    },
  });

  // Query for assignments data
  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ["assignments"],
    queryFn: async () => {
      try {
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
          created_at: assignment.created_at,
          house: undefined // This will be populated from the houses array if needed
        })) || [];
      } catch (error) {
        console.error("Error fetching assignments:", error);
        return [];
      }
    },
  });

  // Safe fetch employee locations function
  const fetchEmployeeLocations = useCallback(async () => {
    try {
      const { data: locations, error } = await supabase
        .from('employee_locations')
        .select('*') as { data: EmployeeLocationRow[] | null, error: any };
      
      if (!error && locations) {
        console.log("Employee locations loaded:", locations.length);
        
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
    } catch (error) {
      console.error("Error fetching employee locations:", error);
      // Ensure we set a default value even on error
      if (employeeLocations.length === 0) {
        setEmployeeLocations([]);
      }
    }
  }, [employeeLocations.length]);

  // Fetch employee locations and set up real-time listener
  useEffect(() => {
    fetchEmployeeLocations();

    let channel;
    try {
      channel = supabase
        .channel('employee-locations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'employee_locations'
          },
          async () => {
            fetchEmployeeLocations();
          }
        )
        .subscribe();
    } catch (error) {
      console.error("Error setting up real-time listener:", error);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel).catch(err => {
          console.error("Error removing channel:", err);
        });
      }
    };
  }, [fetchEmployeeLocations]);

  // Get user location - safely with proper error handling
  useEffect(() => {
    // Use a lightweight function for geolocation to avoid React rendering issues
    const getLocation = () => {
      if ("geolocation" in navigator) {
        try {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setCurrentLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => {
              console.error("Geolocation error:", error);
              // Fall back to New York coordinates
              setCurrentLocation({
                latitude: 40.7128,
                longitude: -74.0060,
              });
            },
            { 
              enableHighAccuracy: false,
              timeout: 5000,
              maximumAge: 10000
            }
          );
        } catch (error) {
          console.error("Error requesting geolocation:", error);
          // Fallback for any other errors
          setCurrentLocation({
            latitude: 40.7128,
            longitude: -74.0060,
          });
        }
      } else {
        // Fallback if geolocation is not available
        setCurrentLocation({
          latitude: 40.7128,
          longitude: -74.0060,
        });
      }
    };

    getLocation();
  }, []);

  // Prepare the dashboard data object to pass to context
  const dashboardData: AdminDashboardContextValue = {
    stats,
    houses,
    assignments,
    currentLocation,
    employeeLocations,
    activeEmployees,
    mockRevenueData,
    mockPickups
  };

  // Provide the context value to children
  return (
    <AdminDashboardContext.Provider value={dashboardData}>
      {children}
    </AdminDashboardContext.Provider>
  );
}
