
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Map from '@/components/Map/Map';
import { House, Location, Assignment } from '@/types/map';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { HouseRow, AssignmentRow } from '@/lib/supabase-types';
import { TimeTracker } from '@/components/employee/TimeTracker';
import { JobAssignments } from '@/components/employee/JobAssignments';
import { RouteOptimizer } from '@/components/employee/RouteOptimizer';
import { Button } from '@/components/ui/button';
import { MapIcon, ClockIcon, MenuIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EmployeeDashboard() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [houses, setHouses] = useState<House[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTracking, setActiveTracking] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('map');

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

    // Get initial location
    navigator.geolocation.getCurrentPosition(
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
  }, [userData]);

  // Set up GPS tracking when clocked in
  useEffect(() => {
    if (!user || !currentLocation || userData?.role !== 'employee') return;

    // Start or stop tracking based on activeTracking state
    if (activeTracking) {
      // Start GPS tracking
      const id = navigator.geolocation.watchPosition(
        async (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          
          setCurrentLocation(newLocation);
          
          // Update location in database
          await updateEmployeeLocation(user.id, newLocation);
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 10000, 
          timeout: 60000 
        }
      );
      
      setWatchId(id);
      
      // Also set up an interval to update location periodically
      const intervalId = setInterval(() => {
        if (user && currentLocation) {
          updateEmployeeLocation(user.id, currentLocation);
        }
      }, 60000); // Update every minute
      
      return () => {
        navigator.geolocation.clearWatch(id);
        clearInterval(intervalId);
      };
    } else if (watchId !== null) {
      // Stop GPS tracking
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      
      // Set employee as offline
      updateEmployeeStatus(user.id, false);
    }
  }, [activeTracking, user, currentLocation, userData?.role]);

  // Update employee location in real-time
  const updateEmployeeLocation = async (userId: string, location: Location) => {
    if (!userId || !location) return;
    
    const locationData = {
      employee_id: userId,
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: new Date().toISOString(),
      is_online: true,
      last_seen_at: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('employee_locations')
        .upsert(locationData, {
          onConflict: 'employee_id'
        });

      if (error) {
        console.error('Error updating location:', error);
      }
    } catch (error) {
      console.error('Exception when updating location:', error);
    }
  };

  // Update employee online status
  const updateEmployeeStatus = async (userId: string, isOnline: boolean) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('employee_locations')
        .update({ 
          is_online: isOnline,
          last_seen_at: new Date().toISOString()
        })
        .eq('employee_id', userId);

      if (error) {
        console.error('Error updating employee status:', error);
      }
    } catch (error) {
      console.error('Exception when updating status:', error);
    }
  };

  // Fetch houses and assignments
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch assignments for this employee
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('assignments')
          .select('*, house:houses(*)')
          .eq('employee_id', user.id) as { data: (AssignmentRow & { house: HouseRow })[] | null, error: any };

        if (assignmentsError) throw assignmentsError;

        if (assignmentsData) {
          // Extract house IDs from assignments
          const houseIds = assignmentsData
            .filter(a => a.house_id)
            .map(a => a.house_id);

          // Fetch houses
          const { data: housesData, error: housesError } = await supabase
            .from('houses')
            .select('*')
            .in('id', houseIds) as { data: HouseRow[] | null, error: any };

          if (housesError) throw housesError;

          if (assignmentsData && housesData) {
            const mappedAssignments: Assignment[] = assignmentsData.map(a => ({
              id: a.id,
              house_id: a.house_id,
              employee_id: a.employee_id,
              status: a.status,
              assigned_date: a.assigned_date,
              completed_at: a.completed_at,
              created_at: a.created_at,
              house: a.house
            }));

            const mappedHouses: House[] = housesData.map(h => ({
              id: h.id,
              address: h.address,
              latitude: h.latitude,
              longitude: h.longitude,
              created_at: h.created_at
            }));

            setAssignments(mappedAssignments);
            setHouses(mappedHouses);
          }
        }
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
            .select('*, house:houses(*)') as { data: (AssignmentRow & { house: HouseRow })[] | null, error: any };

          if (!error && data) {
            const mappedAssignments: Assignment[] = data.map(a => ({
              id: a.id,
              house_id: a.house_id,
              employee_id: a.employee_id,
              status: a.status,
              assigned_date: a.assigned_date,
              completed_at: a.completed_at,
              created_at: a.created_at,
              house: a.house
            }));
            
            setAssignments(mappedAssignments);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(assignmentsChannel);
    };
  }, [user]);

  const handleMarkComplete = async (assignment: Assignment) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', assignment.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Job Completed",
        description: "The job has been marked as completed.",
      });
      
      // Update local state
      setAssignments(prevAssignments => 
        prevAssignments.map(a => 
          a.id === assignment.id 
            ? { ...a, status: 'completed', completed_at: new Date().toISOString() } 
            : a
        )
      );
      
    } catch (error) {
      console.error('Error marking job as complete:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update job status.",
      });
    }
  };

  const handleViewRoute = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setActiveTab('route');
  };

  const handleCloseRoute = () => {
    setSelectedAssignment(null);
    setActiveTab('map');
  };

  if (!userData || userData.role !== 'employee') {
    return null;
  }

  if (loading && !currentLocation) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 h-screen pt-4">
      <div className="text-white mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">Employee Dashboard</h1>
        <p className="text-gray-400 text-sm">Welcome back, {userData.full_name || userData.email}</p>
      </div>

      {/* Mobile Navigation */}
      <div className="block md:hidden mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="map">
              <MapIcon className="h-4 w-4 mr-1" />
              Map
            </TabsTrigger>
            <TabsTrigger value="jobs">
              <ClockIcon className="h-4 w-4 mr-1" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="route" disabled={!selectedAssignment}>
              <MapIcon className="h-4 w-4 mr-1" />
              Route
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="m-0 p-0">
            <div className="grid grid-cols-1 gap-4">
              <TimeTracker onActiveSessionChange={setActiveTracking} />
              <div className="bg-card rounded-lg shadow-lg h-[calc(100vh-16rem)]">
                <Map
                  houses={houses}
                  assignments={assignments}
                  currentLocation={currentLocation}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="jobs" className="m-0 p-0">
            <JobAssignments 
              assignments={assignments} 
              onViewRoute={handleViewRoute} 
              onMarkComplete={handleMarkComplete} 
            />
          </TabsContent>
          
          <TabsContent value="route" className="m-0 p-0">
            {selectedAssignment && (
              <RouteOptimizer
                selectedAssignment={selectedAssignment}
                currentLocation={currentLocation}
                onClose={handleCloseRoute}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-4 h-[calc(100vh-7rem)]">
        <div className="md:col-span-1">
          <div className="space-y-4">
            <TimeTracker onActiveSessionChange={setActiveTracking} />
            {selectedAssignment && (
              <RouteOptimizer
                selectedAssignment={selectedAssignment}
                currentLocation={currentLocation}
                onClose={handleCloseRoute}
              />
            )}
          </div>
        </div>

        <div className="md:col-span-2 lg:col-span-3 bg-card rounded-lg shadow-lg">
          <Map
            houses={houses}
            assignments={assignments}
            currentLocation={currentLocation}
          />
        </div>

        <div className="md:col-span-1">
          <JobAssignments 
            assignments={assignments} 
            onViewRoute={handleViewRoute} 
            onMarkComplete={handleMarkComplete} 
          />
        </div>
      </div>
    </div>
  );
}
