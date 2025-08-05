import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkSessionRow } from "@/lib/supabase-types";
import { formatDistance, parseISO, format } from 'date-fns';
import { Clock, Timer } from "lucide-react";

const TimeTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [clockedInSince, setClockedInSince] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState("0h 0m");
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const userId = user?.id;

  // Get the active work session if there is one
  const { data: activeSession, isLoading: sessionLoading } = useQuery({
    queryKey: ['activeWorkSession', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('employee_id', userId)
        .eq('is_active', true)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data as WorkSessionRow | null;
    },
    enabled: !!userId,
  });

  // Get total hours worked
  const { data: totalHours } = useQuery({
    queryKey: ['totalHoursWorked', userId],
    queryFn: async () => {
      if (!userId) return 0;
      
      const { data, error } = await supabase
        .from('work_sessions')
        .select('total_hours')
        .eq('employee_id', userId);
      
      if (error) throw error;
      
      return data.reduce((acc, session) => acc + (session.total_hours || 0), 0);
    },
    enabled: !!userId,
  });

  // Get recent work sessions
  const { data: recentSessions } = useQuery({
    queryKey: ['recentWorkSessions', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('employee_id', userId)
        .order('clock_in', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      return data as WorkSessionRow[];
    },
    enabled: !!userId,
  });

  // Function to get and update employee location
  const updateEmployeeLocation = useCallback(async (isOnline: boolean) => {
    if (!userId || !navigator.geolocation) return false;

    try {
      if (isOnline) {
        // Only get location if clocking in
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const locationData = {
              employee_id: userId,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              is_online: true,
              timestamp: new Date().toISOString(),
              last_seen_at: new Date().toISOString()
            };
            
            const { error } = await supabase
              .from('employee_locations')
              .upsert(locationData, {
                onConflict: 'employee_id'
              });
              
            if (error) {
              console.error('Error updating location:', error);
              return false;
            }
            
            setLocationEnabled(true);
            return true;
          },
          (error) => {
            console.error("Error getting location:", error);
            toast({
              variant: "destructive",
              title: "Location Error",
              description: "Unable to get your location. Please enable location services."
            });
            return false;
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        // When clocking out, mark as offline but keep the last location
        const { error } = await supabase
          .from('employee_locations')
          .upsert({
            employee_id: userId,
            is_online: false,
            last_seen_at: new Date().toISOString()
          }, {
            onConflict: 'employee_id'
          });
        
        if (error) {
          console.error('Error updating location status:', error);
          return false;
        }
        
        setLocationEnabled(false);
        return true;
      }
    } catch (error) {
      console.error('Error in location tracking:', error);
      return false;
    }
    
    return true;
  }, [userId, toast]);

  // Update elapsed time every minute
  useEffect(() => {
    if (!activeSession) {
      setIsClockedIn(false);
      setClockedInSince(null);
      setElapsedTime("0h 0m");
      return;
    }

    setIsClockedIn(true);
    setClockedInSince(activeSession.clock_in);

    const updateElapsedTime = () => {
      const start = parseISO(activeSession.clock_in);
      const now = new Date();
      const elapsed = formatDistance(now, start, { addSuffix: false });
      setElapsedTime(elapsed);
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activeSession]);

  // Initialize location tracking if already clocked in
  useEffect(() => {
    if (activeSession && userId) {
      setIsClockedIn(true);
      // Check if location is already being tracked
      supabase
        .from('employee_locations')
        .select('*')
        .eq('employee_id', userId)
        .eq('is_online', true)
        .single()
        .then(({ data }) => {
          setLocationEnabled(!!data);
        });
    }
    
    if (!sessionLoading) {
      setLoading(false);
    }
  }, [activeSession, userId, sessionLoading]);

  // Clock in mutation
  const clockIn = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("User not authenticated");
      
      // Start tracking location when clocking in
      await updateEmployeeLocation(true);
      
      // Create new work session
      const { data, error } = await supabase
        .from('work_sessions')
        .insert({
          employee_id: userId,
          clock_in: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data as WorkSessionRow;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['activeWorkSession'] });
      queryClient.invalidateQueries({ queryKey: ['recentWorkSessions'] });
      setClockedInSince(data.clock_in);
      setIsClockedIn(true);
      toast({
        title: "Clocked In",
        description: `You have successfully clocked in at ${format(new Date(), 'h:mm a')}`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to clock in: ${error.message}`,
      });
    }
  });

  // Clock out mutation
  const clockOut = useMutation({
    mutationFn: async () => {
      if (!userId || !activeSession) throw new Error("No active session");
      
      const now = new Date();
      const start = parseISO(activeSession.clock_in);
      const diffInMs = now.getTime() - start.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);
      
      // Stop tracking location when clocking out
      await updateEmployeeLocation(false);
      
      // Update work session
      const { data, error } = await supabase
        .from('work_sessions')
        .update({
          clock_out: now.toISOString(),
          total_hours: parseFloat(diffInHours.toFixed(2)),
          is_active: false
        })
        .eq('id', activeSession.id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeWorkSession'] });
      queryClient.invalidateQueries({ queryKey: ['recentWorkSessions'] });
      queryClient.invalidateQueries({ queryKey: ['totalHoursWorked'] });
      setIsClockedIn(false);
      setClockedInSince(null);
      toast({
        title: "Clocked Out",
        description: `You have successfully clocked out at ${format(new Date(), 'h:mm a')}`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to clock out: ${error.message}`,
      });
    }
  });

  const handleClockIn = () => {
    clockIn.mutate();
  };

  const handleClockOut = () => {
    clockOut.mutate();
  };

  if (loading) {
    return (
      <Card className="col-span-1 h-48 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Tracker
        </CardTitle>
        <CardDescription>Track your work hours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className={`text-lg font-bold ${isClockedIn ? 'text-green-500' : 'text-gray-500'}`}>
                  {isClockedIn ? 'On the clock' : 'Not working'}
                </p>
              </div>
              <div>
                {isClockedIn ? (
                  <Button 
                    variant="destructive" 
                    onClick={handleClockOut} 
                    disabled={clockOut.isPending}
                  >
                    {clockOut.isPending ? "Processing..." : "Clock Out"}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleClockIn} 
                    disabled={clockIn.isPending}
                  >
                    {clockIn.isPending ? "Processing..." : "Clock In"}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {isClockedIn && (
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Clocked in since</p>
                  <p className="font-medium">{clockedInSince ? format(parseISO(clockedInSince), 'h:mm a, MMM d') : '--'}</p>
                </div>
                <div className="flex items-center">
                  <Timer className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{elapsedTime}</span>
                </div>
              </div>
              {locationEnabled && (
                <div className="mt-2 text-xs text-green-600">
                  Location tracking active
                </div>
              )}
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium mb-2">Total Hours This Period</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold">{parseFloat((totalHours || 0).toFixed(1))}</span>
              <span className="text-sm text-muted-foreground mb-1">hours</span>
            </div>
          </div>
          
          {recentSessions && recentSessions.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Recent Work Sessions</p>
              <div className="space-y-2">
                {recentSessions.map((session) => (
                  <div key={session.id} className="text-sm border-b pb-1">
                    <div className="flex justify-between">
                      <span>{format(parseISO(session.clock_in), 'MMM d, yyyy')}</span>
                      <span className="font-medium">{session.total_hours || '--'} hrs</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(parseISO(session.clock_in), 'h:mm a')} - 
                      {session.clock_out 
                        ? format(parseISO(session.clock_out), ' h:mm a') 
                        : ' Current'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTracker;
