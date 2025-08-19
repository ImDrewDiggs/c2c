import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VehicleData {
  id: string;
  vehicle_number: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vehicle_type: string;
  status: string;
  mileage: number | null;
  fuel_type: string | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  assigned_employee?: string;
}

export interface MaintenanceData {
  id: string;
  vehicle_id: string;
  maintenance_type: string;
  description: string;
  scheduled_date: string;
  completed_date: string | null;
  status: string;
  cost: number | null;
  vendor_name: string | null;
  notes: string | null;
  vehicle?: {
    vehicle_number: string;
    make: string;
    model: string;
  };
}

export function useFleetVehicles() {
  return useQuery({
    queryKey: ["fleetVehicles"],
    queryFn: async (): Promise<VehicleData[]> => {
      const { data: vehicles, error: vehiclesError } = await supabase
        .from("vehicles")
        .select("*")
        .order("vehicle_number");

      if (vehiclesError) throw vehiclesError;

      // Get current vehicle assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from("vehicle_assignments")
        .select(`
          vehicle_id,
          profiles!vehicle_assignments_employee_id_fkey(full_name)
        `)
        .is("unassigned_date", null);

      if (assignmentsError) throw assignmentsError;

      return (vehicles || []).map(vehicle => {
        const assignment = assignments?.find(a => a.vehicle_id === vehicle.id);
        return {
          ...vehicle,
          assigned_employee: assignment?.profiles?.full_name || undefined,
        };
      });
    },
  });
}

export function useMaintenanceSchedules() {
  return useQuery({
    queryKey: ["maintenanceSchedules"],
    queryFn: async (): Promise<MaintenanceData[]> => {
      const { data, error } = await supabase
        .from("maintenance_schedules")
        .select(`
          *,
          vehicles!maintenance_schedules_vehicle_id_fkey(
            vehicle_number,
            make,
            model
          )
        `)
        .order("scheduled_date", { ascending: true });

      if (error) throw error;

      return (data || []).map(schedule => ({
        ...schedule,
        vehicle: schedule.vehicles,
      }));
    },
  });
}

export function useFleetAnalytics() {
  return useQuery({
    queryKey: ["fleetAnalytics"],
    queryFn: async () => {
      const { data: vehicles, error } = await supabase
        .from("vehicles")
        .select("status,vehicle_type");

      if (error) throw error;

      const total = vehicles?.length || 0;
      const active = vehicles?.filter(v => v.status === 'active').length || 0;
      const maintenance = vehicles?.filter(v => v.status === 'maintenance').length || 0;
      const trucks = vehicles?.filter(v => v.vehicle_type === 'truck').length || 0;

      return {
        totalVehicles: total,
        activeVehicles: active,
        inMaintenance: maintenance,
        utilizationRate: total > 0 ? (active / total * 100).toFixed(1) : "0",
        trucksCount: trucks,
      };
    },
  });
}