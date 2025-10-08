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
      // First get employee user_ids from user_roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "employee");

      if (rolesError) throw rolesError;
      
      const employeeIds = userRoles?.map(ur => ur.user_id) || [];
      
      if (employeeIds.length === 0) {
        return [];
      }

      // Then fetch profiles for those users
      let query = supabase
        .from("profiles")
        .select("*")
        .in("id", employeeIds)
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(
          `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,job_title.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query.returns<Array<{
        id: string;
        full_name: string | null;
        email: string;
        phone: string | null;
        address: string | null;
        drivers_license: string | null;
        pay_rate: number | null;
        job_title: string | null;
        status: string | null;
        created_at: string;
      }>>();
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