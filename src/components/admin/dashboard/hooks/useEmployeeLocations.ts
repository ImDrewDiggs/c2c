
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { EmployeeLocation } from "@/types/map";
import { EmployeeLocationRow } from "@/lib/supabase-types";

/**
 * Hook to fetch and subscribe to employee locations
 * Returns employee locations and active employee count
 */
export function useEmployeeLocations() {
  const [employeeLocations, setEmployeeLocations] = useState<EmployeeLocation[]>([]);
  const [activeEmployees, setActiveEmployees] = useState<number>(0);

  /**
   * Safe fetch employee locations function
   * Fetches current employee locations from Supabase and handles errors
   */
  const fetchEmployeeLocations = useCallback(async () => {
    try {
      const { data: locations, error } = await supabase
        .from('employee_locations')
        .select('*') as { data: EmployeeLocationRow[] | null, error: any };
      
      if (!error && locations) {
        console.log("Employee locations loaded:", locations.length);
        
        const mappedLocations: EmployeeLocation[] = locations.map(loc => ({
          id: loc.id,
          employee_id: loc.employee_id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          timestamp: loc.timestamp,
          is_online: loc.is_online,
          last_seen_at: loc.last_seen_at
        }));
        
        setEmployeeLocations(mappedLocations);
        setActiveEmployees(mappedLocations.filter(loc => loc.is_online).length);
      }
    } catch (error) {
      console.error("Error fetching employee locations:", error);
      // Ensure we set a default value even on error
      if (employeeLocations.length === 0) {
        setEmployeeLocations([]);
      }
    }
  }, [employeeLocations.length]);

  /**
   * Fetch employee locations and set up real-time listener
   * Uses Supabase realtime to update employee locations when they change
   */
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
