
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { House, Assignment } from "@/types/map";
import { HouseRow, AssignmentRow } from "@/lib/supabase-types";
import { DashboardStats, RevenueDataPoint } from "../types/dashboardTypes";

/**
 * Hook to fetch dashboard data including stats, houses, and assignments
 * Returns all the data needed for the admin dashboard
 */
export function useDashboardData() {
  /**
   * Query for dashboard stats from real database
   */
  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      try {
        const [
          { count: dailyPickups },
          { count: weeklyPickups },
          { count: monthlyPickups },
          { count: pendingPickups },
          { count: completedPickups },
          { data: employeeLocations }
        ] = await Promise.all([
          supabase.from('assignments').select('*', { count: 'exact', head: true }).gte('assigned_date', today.toISOString()),
          supabase.from('assignments').select('*', { count: 'exact', head: true }).gte('assigned_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('assignments').select('*', { count: 'exact', head: true }).gte('assigned_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
          supabase.from('employee_locations').select('employee_id').eq('is_online', true).gte('last_seen_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())
        ]);

        const activeEmployeeIds = new Set(employeeLocations?.map(loc => loc.employee_id) || []);

        return {
          totalUsers: (dailyPickups || 0) + (weeklyPickups || 0), // Using combined as total users
          newSignups: dailyPickups || 0,
          activeEmployees: activeEmployeeIds.size,
          completedJobs: completedPickups || 0,
          pendingJobs: pendingPickups || 0,
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
          totalUsers: 0,
          newSignups: 0,
          activeEmployees: 0,
          completedJobs: 0,
          pendingJobs: 0,
        };
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  }) as { data: DashboardStats | undefined };

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
        
        // Return empty array if no real data
        return [];
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
        
        // Return empty array if no real data
        return [];
      } catch (error) {
        console.error("Error fetching assignments:", error);
        return [];
      }
    },
  });

  /**
   * Real revenue data from database
   */
  const { data: revenueData = [] } = useQuery({
    queryKey: ["revenueData"],
    queryFn: async (): Promise<RevenueDataPoint[]> => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date;
      });

      try {
        const revenuePromises = last7Days.map(async (date) => {
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);

          const { data } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'completed')
            .gte('processed_at', startOfDay.toISOString())
            .lte('processed_at', endOfDay.toISOString());

          const total = data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

          return {
            name: date.toLocaleDateString('en-US', { weekday: 'short' }),
            amount: total / 100, // Convert from cents to dollars
          };
        });

        return await Promise.all(revenuePromises);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        return [];
      }
    },
    refetchInterval: 30000,
  });

  return { 
    stats: stats || {
      totalUsers: 0,
      newSignups: 0,
      activeEmployees: 0,
      completedJobs: 0,
      pendingJobs: 0,
    },
    houses, 
    assignments, 
    revenueData
  };
}
