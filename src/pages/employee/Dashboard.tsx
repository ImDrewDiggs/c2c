
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Map from '@/components/Map/Map';
import { House, Location, Assignment } from '@/types/map';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function EmployeeDashboard() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [houses, setHouses] = useState<House[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user is an employee
  useEffect(() => {
    if (userData && userData.role !== 'employee') {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You must be an employee to access this page.",
      });
      navigate('/');
    }
  }, [userData, navigate]);

  // Get current location
  useEffect(() => {
    if (!userData || userData.role !== 'employee') return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          variant: "destructive",
          title: "Location Error",
          description: "Unable to get your current location. Please enable location services.",
        });
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [userData]);

  // Fetch houses and assignments
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('assignments')
          .select('*, house:houses(*)')
          .eq('employee_id', user.id);

        if (assignmentsError) throw assignmentsError;

        // Get unique house IDs from assignments
        const houseIds = assignmentsData.map(a => a.house_id);

        // Fetch houses
        const { data: housesData, error: housesError } = await supabase
          .from('houses')
          .select('*')
          .in('id', houseIds);

        if (housesError) throw housesError;

        setAssignments(assignmentsData);
        setHouses(housesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your assignments.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user) return;

    const assignmentsChannel = supabase
      .channel('assignments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assignments',
          filter: `employee_id=eq.${user.id}`,
        },
        async (payload) => {
          // Refetch data when assignments change
          const { data, error } = await supabase
            .from('assignments')
            .select('*, house:houses(*)')
            .eq('employee_id', user.id);

          if (!error && data) {
            setAssignments(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(assignmentsChannel);
    };
  }, [user]);

  if (!userData || userData.role !== 'employee') {
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 h-screen">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Employee Dashboard</h1>
        <p className="text-gray-400">Track your assigned locations and current position</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
        <div className="md:col-span-3 bg-card rounded-lg shadow-lg h-full">
          <Map
            houses={houses}
            assignments={assignments}
            currentLocation={currentLocation}
          />
        </div>

        <div className="bg-card p-4 rounded-lg shadow-lg overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-white">Assignments</h2>
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-background p-3 rounded-md">
                <p className="font-medium text-white">{assignment.house?.address}</p>
                <p className="text-sm text-gray-400 capitalize">Status: {assignment.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
