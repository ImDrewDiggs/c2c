import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RealTimeStats {
  totalUsers: number;
  newSignups: number;
  activeEmployees: number;
  completedJobs: number;
  pendingJobs: number;
  todayRevenue: number;
  totalCustomers: number;
  totalEmployees: number;
  totalVehicles: number;
  activeSubscriptions: number;
}

export function useRealTimeStats() {
  return useQuery({
    queryKey: ["realTimeStats"],
    queryFn: async (): Promise<RealTimeStats> => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      try {
        // Fetch all stats in parallel
        const [
          { count: totalUsers },
          { data: newSignups },
          { count: completedToday },
          { count: pendingJobs },
          { data: todayPayments },
          { count: totalCustomers },
          { count: totalEmployees },
          { count: totalVehicles },
          { count: activeSubscriptions },
          { data: employeeLocations }
        ] = await Promise.all([
          // Total users across all roles
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          
          // New signups today
          supabase.from('profiles')
            .select('id')
            .gte('created_at', today.toISOString()),
          
          // Completed assignments today
          supabase.from('assignments')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed')
            .gte('completed_at', today.toISOString()),
          
          // Pending jobs
          supabase.from('assignments')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending'),
          
          // Today's revenue from payments
          supabase.from('payments')
            .select('amount')
            .eq('status', 'completed')
            .gte('processed_at', today.toISOString()),
          
          // Total customers
          supabase.from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'customer'),
          
          // Total employees
          supabase.from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'employee'),
          
          // Total vehicles
          supabase.from('vehicles')
            .select('*', { count: 'exact', head: true }),
          
          // Active subscriptions
          supabase.from('subscriptions')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active'),
          
          // Active employee locations (last 30 minutes)
          supabase.from('employee_locations')
            .select('employee_id')
            .eq('is_online', true)
            .gte('last_seen_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())
        ]);

        // Calculate today's revenue
        const todayRevenue = todayPayments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
        
        // Count unique active employees
        const activeEmployeeIds = new Set(employeeLocations?.map(loc => loc.employee_id) || []);
        const activeEmployees = activeEmployeeIds.size;

        return {
          totalUsers: totalUsers || 0,
          newSignups: newSignups?.length || 0,
          activeEmployees,
          completedJobs: completedToday || 0,
          pendingJobs: pendingJobs || 0,
          todayRevenue: todayRevenue / 100, // Convert from cents to dollars
          totalCustomers: totalCustomers || 0,
          totalEmployees: totalEmployees || 0,
          totalVehicles: totalVehicles || 0,
          activeSubscriptions: activeSubscriptions || 0,
        };
      } catch (error) {
        console.error('Error fetching real-time stats:', error);
        // Return default values if there's an error
        return {
          totalUsers: 0,
          newSignupsToday: 0,
          activeEmployees: 0,
          completedJobsToday: 0,
          pendingJobs: 0,
          todayRevenue: 0,
          totalCustomers: 0,
          totalEmployees: 0,
          totalVehicles: 0,
          activeSubscriptions: 0,
        };
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}