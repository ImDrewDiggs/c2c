import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EmployeePerformance {
  employee_id: string;
  name: string;
  pickups_completed: number;
  avg_time_minutes: number;
}

export interface ReportIssue {
  date: string;
  type: string;
  description: string;
}

export interface ServiceIntegrityReport {
  id: string;
  house_id: string;
  report_month: string;
  total_scheduled_pickups: number;
  completed_pickups: number;
  late_pickups: number;
  missed_pickups: number;
  completion_rate: number;
  employees_assigned: EmployeePerformance[];
  issues: ReportIssue[];
  overall_score: number;
  notes: string | null;
  generated_at: string;
  created_at: string;
  updated_at: string;
  houses?: { address: string };
}

export function useServiceIntegrityReports(month?: string, houseId?: string) {
  return useQuery({
    queryKey: ["serviceIntegrityReports", month, houseId],
    queryFn: async (): Promise<ServiceIntegrityReport[]> => {
      // Use type assertion to bypass strict table name checking for new table
      const client = supabase as unknown as {
        from: (table: string) => ReturnType<typeof supabase.from>;
      };
      
      let query = client
        .from("service_integrity_reports")
        .select("*, houses(address)")
        .order("overall_score", { ascending: true });

      if (month) {
        query = query.eq("report_month", month + "-01");
      }
      if (houseId) {
        query = query.eq("house_id", houseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ServiceIntegrityReport[];
    },
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { month?: string; house_id?: string }) => {
      const { data, error } = await supabase.functions.invoke(
        "generate-integrity-report",
        { body: params }
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Generated ${data.generated} report(s) for ${data.month}`);
      queryClient.invalidateQueries({ queryKey: ["serviceIntegrityReports"] });
    },
    onError: (err: Error) => {
      toast.error("Failed to generate report: " + err.message);
    },
  });
}
