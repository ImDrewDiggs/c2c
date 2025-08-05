import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useCurrentLocation } from "./hooks/useCurrentLocation";
import { useEmployeeLocations } from "./hooks/useEmployeeLocations";

// Real dashboard data interface
interface DashboardData {
  stats: {
    totalUsers: number;
    newSignups: number;
    activeEmployees: number;
    completedJobs: number;
    pendingJobs: number;
  };
  serviceAreas: any[];
  employeeLocations: any[];
  scheduledJobs: any[];
  activityLogs: any[];
  currentLocation: any;
  maintenanceSchedules: any[];
  loading: boolean;
  error: string | null;
}

// Create context with a default value
const SimpleDashboardContext = createContext<DashboardData>({
  stats: {
    totalUsers: 0,
    newSignups: 0,
    activeEmployees: 0,
    completedJobs: 0,
    pendingJobs: 0,
  },
  serviceAreas: [],
  employeeLocations: [],
  scheduledJobs: [],
  activityLogs: [],
  currentLocation: null,
  maintenanceSchedules: [],
  loading: false,
  error: null,
});

// Real provider component with database integration
export function SimpleDashboardProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newSignups: 0,
    activeEmployees: 0,
    completedJobs: 0,
    pendingJobs: 0,
  });
  const [serviceAreas, setServiceAreas] = useState([]);
  const [scheduledJobs, setScheduledJobs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const currentLocation = useCurrentLocation();
  const { employeeLocations, activeEmployees } = useEmployeeLocations();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const [
        { count: totalUsers },
        { data: newSignups },
        { count: completedJobs },
        { count: pendingJobs },
        { data: houses },
        { data: assignments },
        { data: logs },
        { data: maintenance }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('id').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('houses').select('*').limit(10),
        supabase.from('assignments').select('*, houses(*)').limit(10),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('maintenance_schedules').select('*, vehicles(*)').order('scheduled_date', { ascending: true }).limit(10)
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        newSignups: newSignups?.length || 0,
        activeEmployees,
        completedJobs: completedJobs || 0,
        pendingJobs: pendingJobs || 0,
      });

      setServiceAreas(houses || []);
      setScheduledJobs(assignments || []);
      setActivityLogs(logs || []);
      setMaintenanceSchedules(maintenance || []);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const dashboardData: DashboardData = {
    stats,
    serviceAreas,
    employeeLocations,
    scheduledJobs,
    activityLogs,
    currentLocation,
    maintenanceSchedules,
    loading,
    error,
  };

  return (
    <SimpleDashboardContext.Provider value={dashboardData}>
      {children}
    </SimpleDashboardContext.Provider>
  );
}

// Simple hook to use dashboard data
export function useSimpleDashboard() {
  return useContext(SimpleDashboardContext);
}