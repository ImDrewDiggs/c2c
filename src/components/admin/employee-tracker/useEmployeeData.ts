
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { EmployeeLocation } from "@/types/map";
import { EmployeeData } from "./types";
import { useToast } from "@/hooks/use-toast";

export function useEmployeeData(employeeLocations: EmployeeLocation[]) {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const { toast } = useToast();

  // Fetch employee profiles to map to locations
  useEffect(() => {
    async function fetchEmployeeData() {
      setError(null);
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'employee');
        
        if (error) {
          console.error('Error fetching employee profiles:', error);
          setError('Failed to fetch employee profiles');
          toast({
            variant: "destructive",
            title: "Error fetching employee data",
            description: error.message,
          });
          return;
        }

        if (profiles) {
          // Filter out invalid location data
          const validEmployeeLocations = employeeLocations.filter(validateLocation);
          
          if (validEmployeeLocations.length < employeeLocations.length) {
            console.warn(`Filtered out ${employeeLocations.length - validEmployeeLocations.length} invalid location records`);
          }
          
          const employeeData: EmployeeData[] = validEmployeeLocations.map(location => {
            const profile = profiles.find(p => p.id === location.id || p.id === location.employee_id);
            
            return {
              id: location.id || location.employee_id,
              name: profile?.full_name || `Employee ID: ${(location.id || location.employee_id).substring(0, 8)}...`,
              startTime: new Date(location.timestamp || location.lastUpdated || new Date()).toLocaleTimeString(),
              status: location.is_online || location.status === 'active' ? 'active' : 'inactive',
              lastActive: new Date(location.last_seen_at || location.lastUpdated || new Date()).toLocaleString(),
              location: location
            };
          });

          setEmployees(employeeData);
          setFilteredEmployees(employeeData);
        }
      } catch (err) {
        console.error('Unexpected error during employee data fetch:', err);
        setError('An unexpected error occurred while fetching employee data');
        toast({
          variant: "destructive",
          title: "Data fetch error",
          description: "Failed to load employee tracking data. Please try again later.",
        });
      }
    }

    fetchEmployeeData();
  }, [employeeLocations, toast]);

  // Filter employees based on search and status
  useEffect(() => {
    let filtered = employees;
    
    // Apply search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(query) || 
        emp.id.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }
    
    setFilteredEmployees(filtered);
  }, [searchTerm, statusFilter, employees]);

  return { 
    employees, 
    filteredEmployees, 
    searchTerm, 
    statusFilter, 
    setSearchTerm, 
    setStatusFilter, 
    error 
  };
}

// Validate location data
function validateLocation(location: EmployeeLocation): boolean {
  // Extract latitude and longitude from either direct properties or nested location object
  const lat = location.latitude ?? location.location?.latitude;
  const lng = location.longitude ?? location.location?.longitude;
  
  // Check for valid latitude and longitude values
  if (!location || 
      typeof lat !== 'number' || 
      typeof lng !== 'number' ||
      isNaN(lat) || 
      isNaN(lng) ||
      lat < -90 || 
      lat > 90 || 
      lng < -180 || 
      lng > 180) {
    return false;
  }
  return true;
}
