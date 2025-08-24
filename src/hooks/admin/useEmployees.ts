import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EmployeeData {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  drivers_license: string | null;
  pay_rate: number | null;
  job_title: string | null;
  status: 'active' | 'on_leave' | 'inactive' | null;
  created_at: string;
}

export function useEmployees(searchTerm = "") {
  return useQuery({
    queryKey: ["adminEmployees", searchTerm],
    queryFn: async (): Promise<EmployeeData[]> => {
      let query = supabase
        .from("profiles")
        .select("*")
        .eq("role", "employee")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(
          `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,job_title.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        drivers_license: profile.drivers_license,
        pay_rate: profile.pay_rate,
        job_title: profile.job_title,
        status: profile.status as 'active' | 'on_leave' | 'inactive' | null,
        created_at: profile.created_at,
      }));
    },
  });
}