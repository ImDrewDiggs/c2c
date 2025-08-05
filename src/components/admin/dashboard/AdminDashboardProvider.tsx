
import { ReactNode, useState, useEffect } from "react";
import { AdminDashboardContext } from "./contexts/AdminDashboardContext";
import { AdminDashboardProviderProps } from "./types/dashboardTypes";
import { useCurrentLocation } from "./hooks/useCurrentLocation";
import { supabase } from "@/integrations/supabase/client";

/**
 * Dashboard Provider Component
 * Fetches data from Supabase and provides it via context to all dashboard components
 */
export function AdminDashboardProvider({ children }: AdminDashboardProviderProps) {
  // Use the current location hook
  const currentLocation = useCurrentLocation();
  
  // State for all dashboard data
  const [stats, setStats] = useState({
    totalUsers: 0,
    newSignups: 0,
    activeEmployees: 0,
    completedJobs: 0,
    pendingJobs: 0,
  });
  const [employeeLocations, setEmployeeLocations] = useState([]);
  const [serviceAreas, setServiceAreas] = useState([]);
  const [scheduledJobs, setScheduledJobs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch total users count
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, role, created_at')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        // Get count of total users
        const totalUsers = profilesData?.length || 0;
        
        // Calculate new signups this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newSignups = profilesData?.filter(
          user => new Date(user.created_at) > oneWeekAgo
        ).length || 0;
        
        // Count active employees
        const activeEmployees = profilesData?.filter(
          user => user.role === 'employee'
        ).length || 0;

        // Fetch employee locations
        const { data: locationData, error: locationError } = await supabase
          .from('employee_locations')
          .select('*');

        if (locationError) throw locationError;

        // Fetch houses (service areas)
        const { data: housesData, error: housesError } = await supabase
          .from('houses')
          .select('*');

        if (housesError) throw housesError;

        // Fetch assignments (scheduled jobs)
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('assignments')
          .select(`
            *,
            house:houses(*)
          `);

        if (assignmentsError) throw assignmentsError;

        // Count pending and completed jobs
        const pendingJobs = assignmentsData?.filter(
          job => job.status === 'pending'
        ).length || 0;
        
        const completedJobs = assignmentsData?.filter(
          job => job.status === 'completed'
        ).length || 0;

        // Fetch recent activity logs
        const { data: logsData, error: logsError } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (logsError) throw logsError;

        // Update all state
        setStats({
          totalUsers,
          newSignups,
          activeEmployees,
          completedJobs,
          pendingJobs
        });
        setEmployeeLocations(locationData || []);
        setServiceAreas(housesData || []);
        setScheduledJobs(assignmentsData || []);
        setActivityLogs(logsData || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchDashboardData();

    // Set up real-time listeners for employee locations
    const channel = supabase
      .channel('employee-locations-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employee_locations' }, 
        (payload) => {
          console.log('Employee location updated:', payload);
          // Refresh employee locations when there's a change
          supabase
            .from('employee_locations')
            .select('*')
            .then(({ data }) => {
              if (data) setEmployeeLocations(data);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Combine all data for the context
  const dashboardData = {
    stats,
    employeeLocations,
    serviceAreas,
    scheduledJobs,
    activityLogs,
    currentLocation,
    loading,
    error
  };

  // Provide the context value to children
  return (
    <AdminDashboardContext.Provider value={dashboardData}>
      {children}
    </AdminDashboardContext.Provider>
  );
}

// Re-export the hook for easier imports
export { useAdminDashboard } from "./hooks/useAdminDashboard";
