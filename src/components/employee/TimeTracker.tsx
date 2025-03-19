
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, PlayCircle, StopCircle, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { format, formatDistance } from "date-fns";

export function TimeTracker({ onActiveSessionChange }: { onActiveSessionChange?: (isActive: boolean) => void }) {
  const [isClockActive, setIsClockActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState("0:00:00");
  const [totalHoursToday, setTotalHoursToday] = useState(0);
  const [totalHoursWeek, setTotalHoursWeek] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check for active session on component mount
  useEffect(() => {
    if (!user) return;
    checkActiveSession();
    fetchTotalHours();
  }, [user]);

  // Update elapsed time every second when clocked in
  useEffect(() => {
    let interval: number | null = null;
    
    if (isClockActive && currentSession) {
      interval = window.setInterval(() => {
        const start = new Date(currentSession.clock_in);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        setElapsedTime(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isClockActive, currentSession]);

  const checkActiveSession = async () => {
    try {
      const { data, error } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('employee_id', user?.id)
        .eq('is_active', true)
        .order('clock_in', { ascending: false })
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking active session:', error);
        return;
      }
      
      if (data) {
        console.log('Active session found:', data);
        setCurrentSession(data);
        setIsClockActive(true);
        if (onActiveSessionChange) onActiveSessionChange(true);
      }
    } catch (error) {
      console.error('Error in checkActiveSession:', error);
    }
  };

  const fetchTotalHours = async () => {
    try {
      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get the start of the week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      
      // Fetch completed sessions for today
      const { data: todaySessions, error: todayError } = await supabase
        .from('work_sessions')
        .select('total_hours')
        .eq('employee_id', user?.id)
        .eq('is_active', false)
        .gte('clock_in', today.toISOString());
        
      if (todayError) {
        console.error('Error fetching today sessions:', todayError);
      } else {
        const todayHours = todaySessions.reduce((sum, session) => sum + (session.total_hours || 0), 0);
        setTotalHoursToday(todayHours);
      }
      
      // Fetch completed sessions for this week
      const { data: weekSessions, error: weekError } = await supabase
        .from('work_sessions')
        .select('total_hours')
        .eq('employee_id', user?.id)
        .eq('is_active', false)
        .gte('clock_in', startOfWeek.toISOString());
        
      if (weekError) {
        console.error('Error fetching week sessions:', weekError);
      } else {
        const weekHours = weekSessions.reduce((sum, session) => sum + (session.total_hours || 0), 0);
        setTotalHoursWeek(weekHours);
      }
    } catch (error) {
      console.error('Error in fetchTotalHours:', error);
    }
  };

  const handleClockIn = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to clock in",
      });
      return;
    }

    try {
      const now = new Date();
      
      const { data, error } = await supabase
        .from('work_sessions')
        .insert({
          employee_id: user.id,
          clock_in: now.toISOString(),
          is_active: true
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error clocking in:', error);
        toast({
          variant: "destructive",
          title: "Clock In Failed",
          description: "Unable to clock in. Please try again.",
        });
        return;
      }
      
      setCurrentSession(data);
      setIsClockActive(true);
      setElapsedTime("0:00:00");
      if (onActiveSessionChange) onActiveSessionChange(true);
      
      toast({
        title: "Clocked In",
        description: `You clocked in at ${format(now, 'h:mm a')}`,
      });
    } catch (error) {
      console.error('Error in handleClockIn:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  const handleClockOut = async () => {
    if (!currentSession) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No active clock-in session found",
      });
      return;
    }

    try {
      const now = new Date();
      const start = new Date(currentSession.clock_in);
      const diffMs = now.getTime() - start.getTime();
      const totalHours = diffMs / (1000 * 60 * 60);
      
      const { error } = await supabase
        .from('work_sessions')
        .update({
          clock_out: now.toISOString(),
          total_hours: parseFloat(totalHours.toFixed(2)),
          is_active: false
        })
        .eq('id', currentSession.id);
        
      if (error) {
        console.error('Error clocking out:', error);
        toast({
          variant: "destructive",
          title: "Clock Out Failed",
          description: "Unable to clock out. Please try again.",
        });
        return;
      }
      
      setIsClockActive(false);
      setCurrentSession(null);
      if (onActiveSessionChange) onActiveSessionChange(false);
      
      // Update total hours
      fetchTotalHours();
      
      toast({
        title: "Clocked Out",
        description: `You clocked out at ${format(now, 'h:mm a')}. Total time: ${elapsedTime}`,
      });
    } catch (error) {
      console.error('Error in handleClockOut:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg font-medium">
          <Clock className="mr-2 h-5 w-5" />
          Time Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex justify-center items-center">
            <div className="text-3xl font-bold tabular-nums">
              {isClockActive ? elapsedTime : "Not clocked in"}
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
            <div>Today: {totalHoursToday.toFixed(2)} hrs</div>
            <div>This week: {totalHoursWeek.toFixed(2)} hrs</div>
          </div>
          
          {isClockActive ? (
            <div>
              <div className="mb-2 text-sm">
                <Calendar className="inline mr-1 h-4 w-4" />
                Started at: {format(new Date(currentSession?.clock_in), 'h:mm a, MMM d')}
              </div>
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={handleClockOut}
              >
                <StopCircle className="mr-2 h-4 w-4" />
                Clock Out
              </Button>
            </div>
          ) : (
            <Button 
              variant="default" 
              className="w-full bg-green-600 hover:bg-green-700" 
              onClick={handleClockIn}
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Clock In
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
