
import { ReactNode, useState, useEffect, useCallback } from "react";
import { AdminDashboardContext } from "./contexts/AdminDashboardContext";
import { AdminDashboardProviderProps } from "./types/dashboardTypes";
import { useCurrentLocation } from "./hooks/useCurrentLocation";
import { supabase } from "@/integrations/supabase/client";
import { updateDashboardCache } from "@/utils/cacheUtils";

/**
 * Dashboard Provider Component
 * Fetches data from Supabase and provides it via context to all dashboard components
 */
export function AdminDashboardProvider({ children }: AdminDashboardProviderProps) {
  console.log('[AdminDashboardProvider] Initializing...');
  
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
  const [error, setError] = useState<string | null>(null);

  // Move fetchDashboardData outside useEffect to avoid closure issues
  const fetchDashboardData = useCallback(async () => {
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

      // Fetch real data from database tables
      console.log('[AdminDashboardProvider] Fetching employee locations...');
      const { data: locationData, error: locationError } = await supabase
        .from('employee_locations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (locationError) {
        console.warn('[AdminDashboardProvider] Employee locations error:', locationError);
      }

      console.log('[AdminDashboardProvider] Fetching houses...');
      const { data: housesData, error: housesError } = await supabase
        .from('houses')
        .select('*');

      if (housesError) {
        console.warn('[AdminDashboardProvider] Houses error:', housesError);
      }

      console.log('[AdminDashboardProvider] Fetching assignments...');
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*')
        .order('created_at', { ascending: false });

      if (assignmentsError) {
        console.warn('[AdminDashboardProvider] Assignments error:', assignmentsError);
      }

      // Count pending and completed jobs
      const pendingJobs = assignmentsData?.filter(
        job => job.status === 'pending'
      ).length || 0;
      
      const completedJobs = assignmentsData?.filter(
        job => job.status === 'completed'
      ).length || 0;

      console.log('[AdminDashboardProvider] Fetching audit logs...');
      const { data: logsData, error: logsError } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) {
        console.warn('[AdminDashboardProvider] Audit logs error:', logsError);
      }

      // Update all state in a single batch to avoid multiple re-renders
      const newStats = {
        totalUsers,
        newSignups,
        activeEmployees,
        completedJobs,
        pendingJobs
      };
      
      console.log('[AdminDashboardProvider] Setting dashboard data:', newStats);
      
      setStats(newStats);
      setEmployeeLocations(locationData || []);
      setServiceAreas(housesData || []);
      setScheduledJobs(assignmentsData || []);
      setActivityLogs(logsData || []);
      setError(null);
      setLoading(false);
      updateDashboardCache();
      
      console.log('[AdminDashboardProvider] Dashboard data loaded successfully!');
    } catch (err: any) {
      console.error("[AdminDashboardProvider] Error fetching dashboard data:", err);
      setError(err.message);
      setLoading(false);
    }
  }, []); // Empty dependency array since we don't depend on any props or state

  // Fetch dashboard data on mount
  useEffect(() => {
    console.log('[AdminDashboardProvider] Starting initial data fetch...');
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Separate effect for realtime subscriptions to avoid interference
  useEffect(() => {
    console.log('[AdminDashboardProvider] Setting up realtime subscriptions...');
    
    const channel = supabase
      .channel('admin-dashboard-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'employee_locations' }, 
        (payload) => {
          console.log('[AdminDashboardProvider] Employee location updated:', payload);
          // Add a small delay to avoid rapid re-renders
          setTimeout(() => fetchDashboardData(), 100);
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' }, 
        (payload) => {
          console.log('[AdminDashboardProvider] Assignment updated:', payload);
          // Add a small delay to avoid rapid re-renders
          setTimeout(() => fetchDashboardData(), 100);
        }
      )
      .subscribe();

    return () => {
      console.log('[AdminDashboardProvider] Cleaning up realtime subscriptions...');
      supabase.removeChannel(channel);
    };
  }, [fetchDashboardData]);

  // Memoize the dashboard data to prevent unnecessary re-renders
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

  console.log('[AdminDashboardProvider] Rendering with data:', {
    hasStats: !!dashboardData.stats,
    hasEmployeeLocations: !!dashboardData.employeeLocations?.length,
    hasServiceAreas: !!dashboardData.serviceAreas?.length,
    loading: dashboardData.loading,
    error: dashboardData.error
  });

  return (
    <AdminDashboardContext.Provider value={dashboardData}>
      {children}
    </AdminDashboardContext.Provider>
  );
}
