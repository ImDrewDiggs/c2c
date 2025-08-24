import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VehicleData {
  id: string;
  vehicle_number: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vin: string | null;
  vehicle_type: string;
  status: string;
  fuel_type: string | null;
  capacity_cubic_yards: number | null;
  mileage: number | null;
  purchase_date: string | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useVehicles(searchTerm = "") {
  return useQuery({
    queryKey: ["adminVehicles", searchTerm],
    queryFn: async (): Promise<VehicleData[]> => {
      let query = supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(
          `vehicle_number.ilike.%${searchTerm}%,make.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,license_plate.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    },
  });
}

export function useMaintenanceSchedule() {
  return useQuery({
    queryKey: ["maintenanceSchedule"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_schedules")
        .select(`
          *,
          vehicles (
            vehicle_number,
            make,
            model
          )
        `)
        .order("scheduled_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}