
import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Assignment, House, Location } from "@/types/map";

export function useEmployeeDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  // Fetch current employee location
  useEffect(() => {
    if (user?.id) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Set a default location if geolocation fails
          setCurrentLocation({ latitude: 40.7128, longitude: -74.0060 }); // Default to NYC
        }
      );
    }
  }, [user?.id]);

  // Fetch employee's assignments
  const { data: assignments = [] } = useQuery({
    queryKey: ['employeeAssignments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        const { data: assignmentsData, error } = await supabase
          .from('assignments')
          .select(`
            *,
            house:houses(*)
          `)
          .eq('employee_id', user.id);
          
        if (error) throw error;
        
        return assignmentsData.map(assignment => ({
          id: assignment.id,
          house_id: assignment.house_id,
          employee_id: assignment.employee_id,
          status: assignment.status,
          assigned_date: assignment.assigned_date,
          completed_at: assignment.completed_at,
          house: assignment.house as House
        })) as Assignment[];
      } catch (error) {
        console.error("Error fetching assignments:", error);
        return [];
      }
    },
    enabled: !!user?.id,
  });

  return {
    assignments,
    loading,
    setLoading,
    selectedAssignment,
    setSelectedAssignment,
    currentLocation
  };
}
