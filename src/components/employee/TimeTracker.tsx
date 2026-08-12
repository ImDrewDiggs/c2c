import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Square, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEmployeeLocationTracking } from "@/hooks/useEmployeeLocationTracking";
import { format } from "date-fns";

interface TimeTrackerProps {
  userId: string;
}

interface WorkSession {
  id: string;
  clock_in_time: string;
  clock_out_time?: string;
  total_hours?: number;
  status: string;
}

export function TimeTracker({ userId }: TimeTrackerProps) {
  const { toast } = useToast();
  const [isWorking, setIsWorking] = useState(false);
  const [currentSession, setCurrentSession] = useState<WorkSession | null>(null);
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const { captureSnapshot, isTracking, permissionState, lastError } = useEmployeeLocationTracking(userId);

  useEffect(() => {
    fetchWorkSessions();
  }, [userId]);

  const fetchWorkSessions = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      const { data, error } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('employee_id', userId)
        .order('clock_in_time', { ascending: false })
        .limit(10);

      if (error) throw error;

      setSessions(data || []);
      
      // Calculate today's total hours with 0.01 precision
      const todaySessions = data?.filter(session => {
        const sessionDate = new Date(session.clock_in_time);
        return sessionDate >= startOfDay && sessionDate <= endOfDay;
      }) || [];
      
      const totalMinutes = todaySessions.reduce((total, session) => {
        if (session.total_hours) {
          return total + (session.total_hours * 60);
        } else if (session.clock_out_time) {
          const clockIn = new Date(session.clock_in_time);
          const clockOut = new Date(session.clock_out_time);
          return total + ((clockOut.getTime() - clockIn.getTime()) / (1000 * 60));
        }
        return total;
      }, 0);
      
      // Convert to hours with 0.01 precision
      const hours = Math.round((totalMinutes / 60) * 100) / 100;
      setTotalHours(hours);
      
      // Check for active session
      const activeSession = data?.find(session => session.status === 'active');
      setCurrentSession(activeSession || null);
      setIsWorking(!!activeSession);
      
    } catch (error) {
      console.error('Error fetching work sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      // Check for existing active session first
      const { data: existingSession } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('employee_id', userId)
        .eq('status', 'active')
        .limit(1);

      if (existingSession && existingSession.length > 0) {
        toast({
          variant: "destructive",
          title: "Already Clocked In",
          description: "You already have an active work session.",
        });
        setCurrentSession(existingSession[0]);
        setIsWorking(true);
        return;
      }

      // Capture high-accuracy location snapshot before clocking in
      const location = await captureSnapshot();

      const insertPayload: {
        employee_id: string;
        status: 'active';
        clock_in_location_lat?: number;
        clock_in_location_lng?: number;
      } = {
        employee_id: userId,
        status: 'active',
      };

      if (location) {
        insertPayload.clock_in_location_lat = location.latitude;
        insertPayload.clock_in_location_lng = location.longitude;
      }

      const { data, error } = await supabase
        .from('work_sessions')
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(data);
      setIsWorking(true);
      toast({
        title: "Clocked In",
        description: location
          ? "Your work session has started and your location was recorded."
          : "Your work session has started successfully.",
      });
    } catch (error) {
      console.error('Error clocking in:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clock in. Please try again.",
      });
    }
  };

  const clockInWithoutLocation = async () => {
    try {
      // Check for existing active session first
      const { data: existingSession } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('employee_id', userId)
        .eq('status', 'active')
        .limit(1);

      if (existingSession && existingSession.length > 0) {
        toast({
          variant: "destructive",
          title: "Already Clocked In",
          description: "You already have an active work session.",
        });
        setCurrentSession(existingSession[0]);
        setIsWorking(true);
        return;
      }

      const { data, error } = await supabase
        .from('work_sessions')
        .insert({
          employee_id: userId,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(data);
      setIsWorking(true);
      toast({
        title: "Clocked In",
        description: "Your work session has started successfully.",
      });
    } catch (error) {
      console.error('Error clocking in without location:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clock in. Please try again.",
      });
    }
  };

  const handleClockOut = async () => {
    if (!currentSession) return;

    try {
      // Capture high-accuracy location snapshot before clocking out
      const location = await captureSnapshot();

      const clockOutTime = new Date().toISOString();
      const clockInTime = new Date(currentSession.clock_in_time);
      const clockOut = new Date(clockOutTime);

      // Calculate total hours with 0.01 precision
      const totalMinutes = (clockOut.getTime() - clockInTime.getTime()) / (1000 * 60);
      const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

      const updatePayload: {
        clock_out_time: string;
        total_hours: number;
        status: 'completed';
        clock_out_location_lat?: number;
        clock_out_location_lng?: number;
      } = {
        clock_out_time: clockOutTime,
        total_hours: totalHours,
        status: 'completed',
      };

      if (location) {
        updatePayload.clock_out_location_lat = location.latitude;
        updatePayload.clock_out_location_lng = location.longitude;
      }

      const { error } = await supabase
        .from('work_sessions')
        .update(updatePayload)
        .eq('id', currentSession.id);

      if (error) throw error;

      setCurrentSession(null);
      setIsWorking(false);
      toast({
        title: "Clocked Out",
        description: `Session completed: ${totalHours.toFixed(2)} hours recorded`,
      });

      await fetchWorkSessions();
    } catch (error) {
      console.error('Error clocking out:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clock out. Please try again.",
      });
    }
  };

  const clockOutWithoutLocation = async () => {
    if (!currentSession) return;
    
    try {
      const clockOutTime = new Date().toISOString();
      const clockInTime = new Date(currentSession.clock_in_time);
      const clockOut = new Date(clockOutTime);
      
      // Calculate total hours with 0.01 precision
      const totalMinutes = (clockOut.getTime() - clockInTime.getTime()) / (1000 * 60);
      const totalHours = Math.round((totalMinutes / 60) * 100) / 100;
      
      const { error } = await supabase
        .from('work_sessions')
        .update({ 
          clock_out_time: clockOutTime,
          total_hours: totalHours,
          status: 'completed'
        })
        .eq('id', currentSession.id);
        
      if (error) throw error;
      
      setCurrentSession(null);
      setIsWorking(false);
      toast({
        title: "Clocked Out",
        description: `Session completed: ${totalHours.toFixed(2)} hours recorded`
      });
      
      await fetchWorkSessions();
    } catch (error) {
      console.error('Error clocking out without location:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clock out. Please try again."
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Clock In/Out Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Tracker
          </CardTitle>
          <CardDescription>
            Track your work hours and manage your schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Current Status</p>
              <Badge variant={isWorking ? "default" : "secondary"}>
                {isWorking ? "Working" : "Not Working"}
              </Badge>
            </div>
            <div className="flex gap-2">
              {!isWorking ? (
                <Button onClick={handleClockIn} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Clock In
                </Button>
              ) : (
                <Button onClick={handleClockOut} variant="destructive" className="flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  Clock Out
                </Button>
              )}
            </div>
          </div>

          {/* Today's Hours */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {totalHours.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Hours Today</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{sessions.length}</p>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <div 
                  className={`w-16 h-16 rounded-full ${
                    isWorking ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
              </div>
              <p className="text-sm text-muted-foreground">Status</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Sessions
          </CardTitle>
          <CardDescription>Your recent work sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No work sessions yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start tracking your work hours by clocking in above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">
                      {format(new Date(session.clock_in_time), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(session.clock_in_time), 'h:mm a')} - {' '}
                      {session.clock_out_time 
                        ? format(new Date(session.clock_out_time), 'h:mm a')
                        : 'In Progress'
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={session.status === 'active' ? "default" : "secondary"}>
                      {session.status}
                    </Badge>
                    {session.total_hours && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {session.total_hours.toFixed(2)} hours
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}