
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
      
      if (!error && locations && locations.length > 0) {
        console.log("Employee locations loaded from database:", locations.length);
        
        const mappedLocations: EmployeeLocation[] = locations.map(loc => ({
          employee_id: loc.employee_id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          timestamp: loc.timestamp,
          is_online: loc.is_online,
          last_seen_at: loc.last_seen_at
        }));
        
        setEmployeeLocations(mappedLocations);
        setActiveEmployees(mappedLocations.filter(loc => loc.is_online).length);
      } else {
        // Generate realistic mock data for Boston area if no database data
        console.log("Using mock employee location data");
        const mockLocations: EmployeeLocation[] = [
          {
            employee_id: "750e8400-e29b-41d4-a716-446655440000",
            latitude: 42.3601,
            longitude: -71.0589,
            timestamp: new Date().toISOString(),
            is_online: true,
            last_seen_at: new Date().toISOString()
          },
          {
            employee_id: "750e8400-e29b-41d4-a716-446655440001",
            latitude: 42.3475,
            longitude: -71.0972,
            timestamp: new Date().toISOString(),
            is_online: true,
            last_seen_at: new Date().toISOString()
          },
          {
            employee_id: "750e8400-e29b-41d4-a716-446655440002",
            latitude: 42.3736,
            longitude: -71.1097,
            timestamp: new Date().toISOString(),
            is_online: true,
            last_seen_at: new Date().toISOString()
          },
          {
            employee_id: "750e8400-e29b-41d4-a716-446655440003",
            latitude: 42.3523,
            longitude: -71.0748,
            timestamp: new Date().toISOString(),
            is_online: true,
            last_seen_at: new Date().toISOString()
          },
          {
            employee_id: "750e8400-e29b-41d4-a716-446655440004",
            latitude: 42.3412,
            longitude: -71.1212,
            timestamp: new Date().toISOString(),
            is_online: false,
            last_seen_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          },
          {
            employee_id: "750e8400-e29b-41d4-a716-446655440005",
            latitude: 42.3502,
            longitude: -71.0652,
            timestamp: new Date().toISOString(),
            is_online: true,
            last_seen_at: new Date().toISOString()
          },
        ];
        
        setEmployeeLocations(mockLocations);
        setActiveEmployees(mockLocations.filter(loc => loc.is_online).length);
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
