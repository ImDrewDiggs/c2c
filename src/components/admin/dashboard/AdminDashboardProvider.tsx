
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { House, Assignment, EmployeeLocation } from "@/types/map";
import { EmployeeLocationRow, HouseRow, AssignmentRow } from "@/lib/supabase-types";

interface AdminDashboardProviderProps {
  children: (props: AdminDashboardData) => ReactNode;
}

export interface AdminDashboardData {
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

export function AdminDashboardProvider({ children }: AdminDashboardProviderProps) {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [employeeLocations, setEmployeeLocations] = useState<EmployeeLocation[]>([]);
  const [activeEmployees, setActiveEmployees] = useState<number>(0);

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
          setCurrentLocation({
            latitude: 40.7128,
            longitude: -74.0060,
          });
        }
      );
    }
  }, []);

  const dashboardData: AdminDashboardData = {
    stats: stats || { 
      dailyPickups: 0, 
      weeklyPickups: 0,
      monthlyPickups: 0,
      activeEmployees: 0,
      pendingPickups: 0, 
      completedPickups: 0,
      todayRevenue: 0 
    },
    houses,
    assignments,
    currentLocation,
    employeeLocations,
    activeEmployees,
    mockRevenueData,
    mockPickups
  };

  return <>{children(dashboardData)}</>;
}
