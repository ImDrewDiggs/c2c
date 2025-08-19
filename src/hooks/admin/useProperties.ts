import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PropertyData {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  service_frequency?: string;
  last_service?: string;
  next_service?: string;
  status: string;
}

export function useProperties(searchTerm = "") {
  return useQuery({
    queryKey: ["adminProperties", searchTerm],
    queryFn: async (): Promise<PropertyData[]> => {
      // Get houses
      let housesQuery = supabase
        .from("houses")
        .select("*")
        .order("address");

      if (searchTerm) {
        housesQuery = housesQuery.ilike("address", `%${searchTerm}%`);
      }

      const { data: houses, error: housesError } = await housesQuery;
      if (housesError) throw housesError;

      // Get recent assignments to determine customer and service info
      const { data: assignments, error: assignmentsError } = await supabase
        .from("assignments")
        .select(`
          house_id,
          assigned_date,
          completed_at,
          status,
          profiles!assignments_employee_id_fkey(full_name)
        `)
        .order("assigned_date", { ascending: false });

      if (assignmentsError) throw assignmentsError;

      return (houses || []).map(house => {
        const houseAssignments = assignments?.filter(a => a.house_id === house.id) || [];
        const lastCompleted = houseAssignments.find(a => a.completed_at);
        const nextPending = houseAssignments.find(a => a.status === 'pending');

        return {
          ...house,
          status: nextPending ? 'scheduled' : 'available',
          last_service: lastCompleted?.completed_at || null,
          next_service: nextPending?.assigned_date || null,
          service_frequency: 'weekly', // Default, could be determined from subscription data
        };
      });
    },
  });
}

export function usePropertyStats() {
  return useQuery({
    queryKey: ["propertyStats"],
    queryFn: async () => {
      const { data: houses, error } = await supabase
        .from("houses")
        .select("id");

      if (error) throw error;

      const { data: assignments, error: assignmentsError } = await supabase
        .from("assignments")
        .select("house_id,status")
        .in("status", ["pending", "in_progress"]);

      if (assignmentsError) throw assignmentsError;

      const totalProperties = houses?.length || 0;
      const activeServices = assignments?.length || 0;

      return {
        totalProperties,
        activeServices,
        availableProperties: totalProperties - activeServices,
      };
    },
  });
}