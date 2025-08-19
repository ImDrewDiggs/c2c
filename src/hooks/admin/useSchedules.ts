import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ScheduleData {
  id: string;
  house_id: string;
  employee_id: string;
  assigned_date: string;
  completed_at: string | null;
  status: string;
  created_at: string;
  address: string;
  employee_name: string;
  customer_info?: string;
}

export function useSchedules(dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: ["adminSchedules", dateRange],
    queryFn: async (): Promise<ScheduleData[]> => {
      let query = supabase
        .from("assignments")
        .select(`
          *,
          houses!assignments_house_id_fkey(address),
          profiles!assignments_employee_id_fkey(full_name)
        `)
        .order("assigned_date", { ascending: true });

      if (dateRange) {
        query = query
          .gte("assigned_date", dateRange.start)
          .lte("assigned_date", dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(assignment => ({
        ...assignment,
        address: assignment.houses?.address || 'Unknown Address',
        employee_name: assignment.profiles?.full_name || 'Unassigned',
      }));
    },
  });
}

export function useUpcomingSchedules(limit = 10) {
  return useQuery({
    queryKey: ["upcomingSchedules", limit],
    queryFn: async (): Promise<ScheduleData[]> => {
      const { data, error } = await supabase
        .from("assignments")
        .select(`
          *,
          houses!assignments_house_id_fkey(address),
          profiles!assignments_employee_id_fkey(full_name)
        `)
        .eq("status", "pending")
        .gte("assigned_date", new Date().toISOString())
        .order("assigned_date", { ascending: true })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(assignment => ({
        ...assignment,
        address: assignment.houses?.address || 'Unknown Address',
        employee_name: assignment.profiles?.full_name || 'Unassigned',
      }));
    },
  });
}

export function useScheduleStats() {
  return useQuery({
    queryKey: ["scheduleStats"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const [todayResult, pendingResult, completedResult] = await Promise.all([
        supabase
          .from("assignments")
          .select("id")
          .gte("assigned_date", today)
          .lt("assigned_date", new Date(Date.now() + 86400000).toISOString()),
        
        supabase
          .from("assignments")
          .select("id")
          .eq("status", "pending"),
        
        supabase
          .from("assignments")
          .select("id")
          .eq("status", "completed")
          .gte("completed_at", today),
      ]);

      return {
        todayPickups: todayResult.data?.length || 0,
        pendingPickups: pendingResult.data?.length || 0,
        completedToday: completedResult.data?.length || 0,
      };
    },
  });
}