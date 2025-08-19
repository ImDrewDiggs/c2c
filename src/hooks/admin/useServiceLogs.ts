import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ServiceLogData {
  id: string;
  assigned_date: string;
  completed_at: string | null;
  status: string;
  address: string;
  customer: string;
  employee: string;
  duration?: string;
  notes?: string;
}

export function useServiceLogs(searchTerm = "", dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: ["serviceL logs", searchTerm, dateRange],
    queryFn: async (): Promise<ServiceLogData[]> => {
      let query = supabase
        .from("assignments")
        .select(`
          *,
          houses!assignments_house_id_fkey(address),
          profiles!assignments_employee_id_fkey(full_name)
        `)
        .order("assigned_date", { ascending: false });

      if (dateRange) {
        query = query
          .gte("assigned_date", dateRange.start)
          .lte("assigned_date", dateRange.end);
      }

      const { data, error } = await query;
      if (error) throw error;

      let logs = (data || []).map(assignment => {
        const duration = assignment.completed_at 
          ? calculateDuration(assignment.assigned_date, assignment.completed_at)
          : undefined;

        return {
          id: assignment.id,
          assigned_date: assignment.assigned_date,
          completed_at: assignment.completed_at,
          status: assignment.status,
          address: assignment.houses?.address || 'Unknown Address',
          customer: 'Customer', // Would need customer data from subscriptions/orders
          employee: assignment.profiles?.full_name || 'Unassigned',
          duration,
          notes: `Service ${assignment.status}`,
        };
      });

      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        logs = logs.filter(log => 
          log.address.toLowerCase().includes(term) ||
          log.customer.toLowerCase().includes(term) ||
          log.employee.toLowerCase().includes(term) ||
          log.notes?.toLowerCase().includes(term)
        );
      }

      return logs;
    },
  });
}

function calculateDuration(start: string, end: string): string {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diffMs = endTime.getTime() - startTime.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  }
  return `${diffMinutes}m`;
}

export function useServiceStats() {
  return useQuery({
    queryKey: ["serviceStats"],
    queryFn: async () => {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [weekResult, monthResult, totalResult] = await Promise.all([
        supabase
          .from("assignments")
          .select("id")
          .eq("status", "completed")
          .gte("completed_at", weekAgo.toISOString()),
        
        supabase
          .from("assignments")
          .select("id")
          .eq("status", "completed")
          .gte("completed_at", monthAgo.toISOString()),
        
        supabase
          .from("assignments")
          .select("id")
          .eq("status", "completed"),
      ]);

      return {
        completedThisWeek: weekResult.data?.length || 0,
        completedThisMonth: monthResult.data?.length || 0,
        totalCompleted: totalResult.data?.length || 0,
      };
    },
  });
}