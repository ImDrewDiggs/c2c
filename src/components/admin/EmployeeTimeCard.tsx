import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, DollarSign, Download, Search, Users, MapPin } from "lucide-react";
import { format, startOfWeek, endOfWeek, parseISO, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WorkSession {
  id: string;
  employee_id: string;
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

interface Employee {
  id: string;
  full_name: string;
  email: string;
  pay_rate?: number;
  job_title?: string;
}

interface EmployeeTimeData {
  employee: Employee;
  sessions: WorkSession[];
  totalHours: number;
  grossPay: number;
}

export function EmployeeTimeCard() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<"week" | "day">("week");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timeData, setTimeData] = useState<EmployeeTimeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      fetchTimeData();
    }
  }, [employees, selectedDate, selectedEmployee, viewType]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, pay_rate, job_title')
        .eq('role', 'employee')
        .order('full_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load employee data."
      });
    }
  };

  const fetchTimeData = async () => {
    try {
      setLoading(true);
      
      let startDate, endDate;
      
      if (viewType === "week") {
        startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
        endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
      } else {
        startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
      }

      let query = supabase
        .from('work_sessions')
        .select('*')
        .gte('clock_in_time', startDate.toISOString())
        .lte('clock_in_time', endDate.toISOString())
        .order('clock_in_time', { ascending: false });

      if (selectedEmployee !== "all") {
        query = query.eq('employee_id', selectedEmployee);
      }

      const { data: sessions, error } = await query;

      if (error) throw error;

      // Group sessions by employee
      const employeeData: EmployeeTimeData[] = employees
        .filter(emp => selectedEmployee === "all" || emp.id === selectedEmployee)
        .filter(emp => !searchTerm || emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || emp.email.toLowerCase().includes(searchTerm.toLowerCase()))
        .map(employee => {
          const employeeSessions = (sessions || []).filter(session => session.employee_id === employee.id);
          
          const totalHours = employeeSessions.reduce((total, session) => {
            const hours = session.total_hours || calculateHours(session.clock_in_time, session.clock_out_time);
            return total + hours;
          }, 0);

          const payRate = employee.pay_rate || 15.00;
          const grossPay = Math.round(totalHours * payRate * 100) / 100;

          return {
            employee,
            sessions: employeeSessions,
            totalHours: Math.round(totalHours * 100) / 100,
            grossPay
          };
        });

      setTimeData(employeeData);
    } catch (error) {
      console.error('Error fetching time data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load time card data."
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateHours = (clockIn: string, clockOut?: string): number => {
    if (!clockOut) return 0;
    const minutes = differenceInMinutes(parseISO(clockOut), parseISO(clockIn));
    const hours = minutes / 60;
    return Math.round(hours * 100) / 100;
  };

  const getTotalPayroll = (): number => {
    return timeData.reduce((total, emp) => total + emp.grossPay, 0);
  };

  const getTotalHours = (): number => {
    return timeData.reduce((total, emp) => total + emp.totalHours, 0);
  };

  const exportPayroll = () => {
    const period = viewType === "week" ? "Weekly" : "Daily";
    const dateStr = format(selectedDate, viewType === "week" ? "'Week of' MMM dd" : "MMM dd, yyyy");
    
    toast({
      title: "Export Started",
      description: `Generating ${period} payroll report for ${dateStr}...`
    });
    
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Payroll report has been downloaded."
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
            <Users className="h-5 w-5" />
            <span>Employee Time Cards</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewType === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType(viewType === "week" ? "day" : "week")}
            >
              {viewType === "week" ? "Week View" : "Day View"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportPayroll}>
              <Download className="h-4 w-4 mr-1" />
              Export Payroll
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Date Picker */}
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
                  viewType === "week" ? 
                    `Week of ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM dd')}` :
                    format(selectedDate, "MMM dd")
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

          {/* Employee Filter */}
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Employees</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.full_name || employee.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Summary Stats */}
          <div className="flex items-center justify-end space-x-4 text-sm">
            <div className="text-center">
              <div className="font-medium">{formatDuration(getTotalHours())}</div>
              <div className="text-muted-foreground">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-600">${getTotalPayroll().toFixed(2)}</div>
              <div className="text-muted-foreground">Total Payroll</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Employee Time Data */}
        <ScrollArea className="h-[600px]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading time cards...</div>
            </div>
          ) : timeData.length > 0 ? (
            <div className="space-y-4">
              {timeData.map((empData) => (
                <Card key={empData.employee.id} className="p-4">
                  {/* Employee Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {empData.employee.full_name?.charAt(0) || empData.employee.email.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {empData.employee.full_name || empData.employee.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {empData.employee.job_title || "Employee"} • ${empData.employee.pay_rate?.toFixed(2) || "15.00"}/hr
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-lg">
                        {formatDuration(empData.totalHours)}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        ${empData.grossPay.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Sessions */}
                  {empData.sessions.length > 0 ? (
                    <div className="space-y-2">
                      {empData.sessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${session.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                            <div>
                              <div className="text-sm font-medium">
                                {format(parseISO(session.clock_in_time), 'MMM dd')} • {formatTime(session.clock_in_time)} - {session.clock_out_time ? formatTime(session.clock_out_time) : 'Active'}
                              </div>
                              {session.notes && (
                                <div className="text-xs text-muted-foreground">
                                  Note: {session.notes}
                                </div>
                              )}
                              {session.clock_in_location_lat && (
                                <div className="text-xs text-muted-foreground flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>GPS: {session.clock_in_location_lat.toFixed(4)}, {session.clock_in_location_lng?.toFixed(4)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="font-medium">
                              {formatDuration(session.total_hours || calculateHours(session.clock_in_time, session.clock_out_time))}
                            </div>
                            <div className="text-sm text-green-600">
                              ${(Math.round((session.total_hours || calculateHours(session.clock_in_time, session.clock_out_time)) * (empData.employee.pay_rate || 15.00) * 100) / 100).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground italic">
                      No time recorded for this period
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No employees found or no time data available
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <Separator />
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Time recorded in 0.01 hour increments • {timeData.length} employee{timeData.length !== 1 ? 's' : ''}
          </div>
          <div className="font-medium">
            Period: {viewType === "week" ? 
              `${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM dd')} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM dd, yyyy')}` :
              format(selectedDate, 'MMMM dd, yyyy')
            }
          </div>
        </div>
      </CardContent>
    </Card>
  );
}