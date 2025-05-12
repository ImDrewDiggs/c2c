
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
      
      if (!error && locations && locations.length > 0) {
        console.log("Employee locations loaded from database:", locations.length);
        
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
      } else {
        // Generate realistic mock data for Boston area if no database data
        console.log("Using mock employee location data");
        const mockLocations: EmployeeLocation[] = [
          {
            id: "14f2a771-3b8e-47a4-83c2-5278b561d43a",
            employee_id: "750e8400-e29b-41d4-a716-446655440000",
            latitude: 42.3601,
            longitude: -71.0589,
            timestamp: new Date().toISOString(),
            is_online: true,
            last_seen_at: new Date().toISOString()
          },
          {
            id: "29d3b024-5c4a-4172-a8f1-9cd9bfc91a22",
            employee_id: "750e8400-e29b-41d4-a716-446655440001",
            latitude: 42.3475,
            longitude: -71.0972,
            timestamp: new Date().toISOString(),
            is_online: true,
            last_seen_at: new Date().toISOString()
          },
          {
            id: "3c1f593e-6bc9-4d8b-aeb0-7d4e25b8c1d3",
            employee_id: "750e8400-e29b-41d4-a716-446655440002",
            latitude: 42.3736,
            longitude: -71.1097,
            timestamp: new Date().toISOString(),
            is_online: true,
            last_seen_at: new Date().toISOString()
          },
          {
            id: "4a7e2d6f-9c10-483b-95e8-628df419ab54",
            employee_id: "750e8400-e29b-41d4-a716-446655440003",
            latitude: 42.3523,
            longitude: -71.0748,
            timestamp: new Date().toISOString(),
            is_online: true,
            last_seen_at: new Date().toISOString()
          },
          {
            id: "5b8d7f1e-2a9c-4e67-b0d3-1fc48e93a2c5",
            employee_id: "750e8400-e29b-41d4-a716-446655440004",
            latitude: 42.3412,
            longitude: -71.1212,
            timestamp: new Date().toISOString(),
            is_online: false,
            last_seen_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
          },
          {
            id: "6f9c4e8d-3b5a-47d2-91f0-835ca6d07b16",
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
