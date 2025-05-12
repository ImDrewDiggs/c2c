
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
   * Uses TanStack Query for data fetching with real-world-like values
   */
  const { data: stats = {
    dailyPickups: 37,
    weeklyPickups: 224,
    monthlyPickups: 843,
    activeEmployees: 12,
    pendingPickups: 18,
    completedPickups: 19,
    todayRevenue: 3850,
  }} = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => ({
      dailyPickups: 37,
      weeklyPickups: 224,
      monthlyPickups: 843,
      activeEmployees: 12,
      pendingPickups: 18,
      completedPickups: 19,
      todayRevenue: 3850,
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
        
        if (data && data.length > 0) {
          return data.map(house => ({
            id: house.id,
            address: house.address,
            latitude: house.latitude,
            longitude: house.longitude,
            created_at: house.created_at
          })) || [];
        }
        
        // Return mock data if no real data is available
        return [
          {
            id: "550e8400-e29b-41d4-a716-446655440000",
            address: "123 Main St, Boston, MA 02108",
            latitude: 42.3601,
            longitude: -71.0589,
            created_at: "2024-05-01T12:00:00Z"
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440001",
            address: "456 Park Ave, Boston, MA 02215",
            latitude: 42.3475,
            longitude: -71.0972,
            created_at: "2024-05-02T14:30:00Z"
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440002",
            address: "789 Washington St, Cambridge, MA 02139",
            latitude: 42.3736,
            longitude: -71.1097,
            created_at: "2024-05-03T09:15:00Z"
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440003",
            address: "101 Commonwealth Ave, Boston, MA 02116",
            latitude: 42.3523,
            longitude: -71.0748,
            created_at: "2024-05-04T16:45:00Z"
          },
          {
            id: "550e8400-e29b-41d4-a716-446655440004",
            address: "222 Beacon St, Brookline, MA 02446",
            latitude: 42.3412,
            longitude: -71.1212,
            created_at: "2024-05-05T11:30:00Z"
          },
        ];
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
        
        if (data && data.length > 0) {
          return data.map(assignment => ({
            id: assignment.id,
            house_id: assignment.house_id,
            employee_id: assignment.employee_id,
            status: assignment.status,
            assigned_date: assignment.assigned_date,
            completed_at: assignment.completed_at,
            created_at: assignment.created_at,
            house: undefined // This will be populated from the houses array if needed
          })) || [];
        }
        
        // Return mock data if no real data is available
        return [
          {
            id: "650e8400-e29b-41d4-a716-446655440000",
            house_id: "550e8400-e29b-41d4-a716-446655440000",
            employee_id: "750e8400-e29b-41d4-a716-446655440000",
            status: "completed",
            assigned_date: "2025-05-10T09:00:00Z",
            completed_at: "2025-05-10T10:15:00Z",
            created_at: "2025-05-09T16:30:00Z",
            house: undefined
          },
          {
            id: "650e8400-e29b-41d4-a716-446655440001",
            house_id: "550e8400-e29b-41d4-a716-446655440001",
            employee_id: "750e8400-e29b-41d4-a716-446655440001",
            status: "in_progress",
            assigned_date: "2025-05-12T13:30:00Z",
            completed_at: null,
            created_at: "2025-05-11T08:45:00Z",
            house: undefined
          },
          {
            id: "650e8400-e29b-41d4-a716-446655440002",
            house_id: "550e8400-e29b-41d4-a716-446655440002",
            employee_id: "750e8400-e29b-41d4-a716-446655440002",
            status: "pending",
            assigned_date: "2025-05-13T14:00:00Z",
            completed_at: null,
            created_at: "2025-05-11T17:20:00Z",
            house: undefined
          },
          {
            id: "650e8400-e29b-41d4-a716-446655440003",
            house_id: "550e8400-e29b-41d4-a716-446655440003",
            employee_id: "750e8400-e29b-41d4-a716-446655440001",
            status: "pending",
            assigned_date: "2025-05-14T11:15:00Z",
            completed_at: null,
            created_at: "2025-05-11T19:45:00Z",
            house: undefined
          },
          {
            id: "650e8400-e29b-41d4-a716-446655440004",
            house_id: "550e8400-e29b-41d4-a716-446655440004",
            employee_id: "750e8400-e29b-41d4-a716-446655440000",
            status: "pending",
            assigned_date: "2025-05-15T09:30:00Z",
            completed_at: null,
            created_at: "2025-05-12T07:15:00Z",
            house: undefined
          },
        ];
      } catch (error) {
        console.error("Error fetching assignments:", error);
        return [];
      }
    },
  });

  /**
   * Realistic data for the revenue chart - used for visualization
   */
  const mockRevenueData: RevenueDataPoint[] = [
    { name: "Mon", amount: 3850 },
    { name: "Tue", amount: 4200 },
    { name: "Wed", amount: 3950 },
    { name: "Thu", amount: 4400 },
    { name: "Fri", amount: 5100 },
    { name: "Sat", amount: 3600 },
    { name: "Sun", amount: 3200 },
  ];

  /**
   * Realistic data for pickup list - used for visualization
   */
  const mockPickups: MockPickup[] = [
    {
      id: 1,
      address: "123 Main St, Boston, MA",
      status: "Completed",
      scheduledTime: "9:30 AM",
      assignedTo: "Michael Johnson",
    },
    {
      id: 2,
      address: "456 Park Ave, Boston, MA",
      status: "In Progress",
      scheduledTime: "11:15 AM",
      assignedTo: "Sarah Williams",
    },
    {
      id: 3,
      address: "789 Washington St, Cambridge, MA",
      status: "Pending",
      scheduledTime: "1:30 PM",
      assignedTo: "David Wilson",
    },
    {
      id: 4,
      address: "101 Commonwealth Ave, Boston, MA",
      status: "Pending",
      scheduledTime: "3:00 PM",
      assignedTo: "Jennifer Brown",
    },
    {
      id: 5,
      address: "222 Beacon St, Brookline, MA",
      status: "Pending",
      scheduledTime: "4:45 PM",
      assignedTo: "Michael Johnson",
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
