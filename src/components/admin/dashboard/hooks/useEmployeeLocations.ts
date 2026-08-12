
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeLocation } from "@/types/map";
import { EmployeeLocationRow } from "@/lib/supabase-types";

const OFFLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to fetch and subscribe to employee locations.
 *
 * - Reads live rows from employee_locations.
 * - Marks employees as offline if their last_seen_at is older than 5 minutes.
 * - Sets up a realtime subscription so the admin dashboard updates as locations arrive.
 */
export function useEmployeeLocations() {
  const [employeeLocations, setEmployeeLocations] = useState<EmployeeLocation[]>([]);
  const [activeEmployees, setActiveEmployees] = useState<number>(0);

  const normalizeLocations = useCallback((locations: EmployeeLocationRow[]): EmployeeLocation[] => {
    const now = Date.now();

    return locations.map((loc) => {
      const lastSeenMs = loc.last_seen_at ? new Date(loc.last_seen_at).getTime() : 0;
      const isFresh = now - lastSeenMs < OFFLINE_THRESHOLD_MS;

      return {
        employee_id: loc.employee_id,
        latitude: loc.latitude,
        longitude: loc.longitude,
        timestamp: loc.timestamp,
        is_online: loc.is_online && isFresh,
        last_seen_at: loc.last_seen_at,
      };
    });
  }, []);

  const fetchEmployeeLocations = useCallback(async () => {
    try {
      const { data: locations, error } = await supabase
        .from('employee_locations')
        .select('*') as { data: EmployeeLocationRow[] | null, error: any };

      if (error) throw error;

      const mappedLocations = normalizeLocations(locations || []);
      setEmployeeLocations(mappedLocations);
      setActiveEmployees(mappedLocations.filter(loc => loc.is_online).length);
    } catch (error) {
      console.error("Error fetching employee locations:", error);
      setEmployeeLocations([]);
      setActiveEmployees(0);
    }
  }, [normalizeLocations]);

  useEffect(() => {
    fetchEmployeeLocations();

    let channel;
    try {
      channel = supabase
        .channel('employee-locations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'employee_locations'
          },
          async () => {
            fetchEmployeeLocations();
          }
        )
        .subscribe();
    } catch (error) {
      console.error("Error setting up real-time listener:", error);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel).catch(err => {
          console.error("Error removing channel:", err);
        });
      }
    };
  }, [fetchEmployeeLocations]);

  return { employeeLocations, activeEmployees };
}
