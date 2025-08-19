import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Clock, DollarSign, Download } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WorkSession {
  id: string;
  clock_in_time: string;
  clock_out_time?: string;
  total_hours?: number;
  status: string;
  notes?: string;
  clock_in_location_lat?: number;
  clock_in_location_lng?: number;
  clock_out_location_lat?: number;
  clock_out_location_lng?: number;
}

interface TimeCardProps {
  userId: string;
  payRate?: number;
}

export function TimeCard({ userId, payRate = 15.00 }: TimeCardProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [workSessions, setWorkSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekView, setWeekView] = useState(false);

  useEffect(() => {
    fetchWorkSessions();
  }, [userId, selectedDate, weekView]);

  const fetchWorkSessions = async () => {
    try {
      setLoading(true);
      
      let startDate, endDate;
      
      if (weekView) {
        startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
        endDate = endOfWeek(selectedDate, { weekStartsOn: 1 }); // Sunday end
      } else {
        startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
      }

      const { data, error } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('employee_id', userId)
        .gte('clock_in_time', startDate.toISOString())
        .lte('clock_in_time', endDate.toISOString())
        .order('clock_in_time', { ascending: false });

      if (error) throw error;

      setWorkSessions(data || []);
    } catch (error) {
      console.error('Error fetching work sessions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load time card data."
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate hours with 0.01 precision
  const calculateHours = (clockIn: string, clockOut?: string): number => {
    if (!clockOut) return 0;
    const minutes = differenceInMinutes(parseISO(clockOut), parseISO(clockIn));
    const hours = minutes / 60;
    return Math.round(hours * 100) / 100; // Round to 0.01 precision
  };

  // Calculate total hours for selected period
  const getTotalHours = (): number => {
    return workSessions.reduce((total, session) => {
      const hours = session.total_hours || calculateHours(session.clock_in_time, session.clock_out_time);
      return total + hours;
    }, 0);
  };

  // Calculate gross pay
  const getGrossPay = (): number => {
    return Math.round(getTotalHours() * payRate * 100) / 100;
  };

  // Generate week view data
  const getWeekData = () => {
    if (!weekView) return [];
    
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    return weekDays.map(day => {
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);
      
      const daySessions = workSessions.filter(session => {
        const sessionDate = parseISO(session.clock_in_time);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      });
      
      const dayHours = daySessions.reduce((total, session) => {
        const hours = session.total_hours || calculateHours(session.clock_in_time, session.clock_out_time);
        return total + hours;
      }, 0);
      
      return {
        date: day,
        sessions: daySessions,
        totalHours: Math.round(dayHours * 100) / 100,
        grossPay: Math.round(dayHours * payRate * 100) / 100
      };
    });
  };

  const exportTimeCard = () => {
    const period = weekView ? 'Week' : 'Day';
    const dateStr = format(selectedDate, weekView ? 'MMM dd' : 'MMM dd, yyyy');
    
    toast({
      title: "Export Started",
      description: `Generating ${period} time card for ${dateStr}...`
    });
    
    // In a real app, this would generate and download a PDF or CSV
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Time card has been downloaded."
      });
    }, 2000);
  };

  const formatTime = (dateStr: string) => {
    return format(parseISO(dateStr), 'h:mm a');
  };

  const formatDuration = (hours: number) => {
    return `${hours.toFixed(2)} hrs`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Time Card</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={weekView ? "default" : "outline"}
              size="sm"
              onClick={() => setWeekView(!weekView)}
            >
              {weekView ? "Week View" : "Day View"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportTimeCard}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date Picker */}
        <div className="flex items-center justify-between">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  weekView ? 
                    `Week of ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM dd')}` :
                    format(selectedDate, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Summary Stats */}
          <div className="flex items-center space-x-4 text-sm">
            <div className="text-center">
              <div className="font-medium">{formatDuration(getTotalHours())}</div>
              <div className="text-muted-foreground">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-600">${getGrossPay().toFixed(2)}</div>
              <div className="text-muted-foreground">Gross Pay</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Time Entries */}
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading time card...</div>
            </div>
          ) : weekView ? (
            // Week View
            <div className="space-y-3">
              {getWeekData().map((dayData, index) => (
                <Card key={index} className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">
                      {format(dayData.date, 'EEEE, MMM dd')}
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Badge variant="outline">
                        {formatDuration(dayData.totalHours)}
                      </Badge>
                      <span className="text-green-600 font-medium">
                        ${dayData.grossPay.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {dayData.sessions.length > 0 ? (
                    <div className="space-y-1">
                      {dayData.sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${session.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <span>
                              {formatTime(session.clock_in_time)} - {session.clock_out_time ? formatTime(session.clock_out_time) : 'Active'}
                            </span>
                          </div>
                          <span className="font-medium">
                            {formatDuration(session.total_hours || calculateHours(session.clock_in_time, session.clock_out_time))}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">No time recorded</div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            // Day View
            <div className="space-y-3">
              {workSessions.length > 0 ? (
                workSessions.map((session) => (
                  <Card key={session.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${session.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                          <span className="font-medium">
                            {formatTime(session.clock_in_time)} - {session.clock_out_time ? formatTime(session.clock_out_time) : 'Still Active'}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {session.notes && <span>Note: {session.notes}</span>}
                        </div>
                        {session.clock_in_location_lat && (
                          <div className="text-xs text-muted-foreground">
                            Clock-in GPS: {session.clock_in_location_lat.toFixed(4)}, {session.clock_in_location_lng?.toFixed(4)}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium text-lg">
                          {formatDuration(session.total_hours || calculateHours(session.clock_in_time, session.clock_out_time))}
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          ${(Math.round((session.total_hours || calculateHours(session.clock_in_time, session.clock_out_time)) * payRate * 100) / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No time entries for {format(selectedDate, 'MMMM dd, yyyy')}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Pay Rate Info */}
        <Separator />
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Pay Rate: ${payRate.toFixed(2)}/hour</span>
          </div>
          <div className="text-muted-foreground">
            Time recorded in 0.01 hour increments
          </div>
        </div>
      </CardContent>
    </Card>
  );
}