
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
    console.log('[AdminDashboardProvider] Starting data fetch...');
    async function fetchDashboardData() {
      try {
        console.log('[AdminDashboardProvider] Fetching profiles...');
        // Fetch total users count
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, role, created_at')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('[AdminDashboardProvider] Profiles error:', profilesError);
          throw profilesError;
        }

        console.log('[AdminDashboardProvider] Profiles data:', profilesData?.length, 'users');

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

        console.log('[AdminDashboardProvider] Using mock data for missing tables...');
        // Temporarily use mock data until types regenerate
        const locationData = [];
        const housesData = [];
        const assignmentsData = [];

        // Count pending and completed jobs
        const pendingJobs = assignmentsData?.filter(
          job => job.status === 'pending'
        ).length || 0;
        
        const completedJobs = assignmentsData?.filter(
          job => job.status === 'completed'
        ).length || 0;

        // Temporarily use mock data until types regenerate
        const logsData = [];

        // Update all state
        console.log('[AdminDashboardProvider] Setting dashboard stats:', {
          totalUsers,
          newSignups,
          activeEmployees,
          completedJobs,
          pendingJobs
        });
        
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
        console.log('[AdminDashboardProvider] Dashboard data loaded successfully!');
      } catch (err: any) {
        console.error("[AdminDashboardProvider] Error fetching dashboard data:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    console.log('[AdminDashboardProvider] Starting fetchDashboardData...');
    fetchDashboardData();

    // Set up real-time listeners for employee locations
    const channel = supabase
      .channel('employee-locations-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employee_locations' }, 
        (payload) => {
          console.log('Employee location updated:', payload);
          // Temporarily disabled until types regenerate
          console.log('Employee location change detected');
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
