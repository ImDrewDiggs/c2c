
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { House, Assignment } from "@/types/map";
import { HouseRow, AssignmentRow } from "@/lib/supabase-types";
import { DashboardStats, RevenueDataPoint, MockPickup } from "../types/dashboardTypes";

/**
 * Hook to fetch dashboard data including stats, houses, and assignments
 * Returns all the data needed for the admin dashboard
 */
export function useDashboardData() {
  /**
   * Query for dashboard stats
   * Uses TanStack Query for data fetching with default values when data is loading
   */
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
  }) as { data: DashboardStats };

  /**
   * Query for houses data
   * Fetches house data from Supabase and transforms it to match the House type
   */
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

  /**
   * Query for assignments data
   * Fetches assignment data from Supabase and transforms it to match the Assignment type
   */
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

  /**
   * Mock data for the charts - used for visualization without DB dependency
   */
  const mockRevenueData: RevenueDataPoint[] = [
    { name: "Mon", amount: 1200 },
    { name: "Tue", amount: 900 },
    { name: "Wed", amount: 1600 },
    { name: "Thu", amount: 1400 },
    { name: "Fri", amount: 2100 },
    { name: "Sat", amount: 800 },
    { name: "Sun", amount: 600 },
  ];

  /**
   * Mock data for pickup list - used for visualization without DB dependency
   */
  const mockPickups: MockPickup[] = [
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

  return {
    stats,
    houses,
    assignments,
    mockRevenueData,
    mockPickups
  };
}
