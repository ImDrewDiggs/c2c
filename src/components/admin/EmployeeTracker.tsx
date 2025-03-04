
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MapPin, RefreshCw, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeLocation, Location } from "@/types/map";
import Map from "@/components/Map/Map";

interface EmployeeData {
  id: string;
  name: string;
  startTime: string;
  status: "active" | "inactive";
  lastActive: string;
  location: EmployeeLocation;
}

interface EmployeeTrackerProps {
  employeeLocations: EmployeeLocation[];
  currentLocation: Location | null;
}

export function EmployeeTracker({ employeeLocations, currentLocation }: EmployeeTrackerProps) {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Fetch employee profiles to map to locations
  useEffect(() => {
    async function fetchEmployeeData() {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'employee');
      
      if (error) {
        console.error('Error fetching employee profiles:', error);
        return;
      }

      if (profiles) {
        const employeeData: EmployeeData[] = employeeLocations.map(location => {
          const profile = profiles.find(p => p.id === location.employee_id);
          
          return {
            id: location.employee_id,
            name: profile?.full_name || 'Unknown Employee',
            startTime: new Date(location.timestamp || new Date()).toLocaleTimeString(),
            status: location.is_online ? 'active' : 'inactive',
            lastActive: new Date(location.last_seen_at || new Date()).toLocaleString(),
            location: location
          };
        });

        setEmployees(employeeData);
      }
    }

    fetchEmployeeData();
  }, [employeeLocations]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Filter locations to only show selected employee if one is selected
  const filteredLocations = selectedEmployee
    ? employeeLocations.filter(loc => loc.employee_id === selectedEmployee)
    : employeeLocations;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Real-Time Employee Tracking</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id} className={selectedEmployee === employee.id ? 'bg-accent/20' : ''}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell>{employee.startTime}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    employee.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {employee.status === 'active' ? 'On Duty' : 'Offline'}
                  </span>
                </TableCell>
                <TableCell>{employee.lastActive}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      if (selectedEmployee === employee.id) {
                        setSelectedEmployee(null);
                      } else {
                        setSelectedEmployee(employee.id);
                      }
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    {selectedEmployee === employee.id ? 'Show All' : 'Track'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {employees.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  No active employees found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Map for employee tracking */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">
          {selectedEmployee 
            ? `Tracking: ${employees.find(e => e.id === selectedEmployee)?.name || 'Employee'}`
            : 'Employee Locations'}
        </h3>
        <div className="h-[400px]">
          <Map
            houses={[]}
            assignments={[]}
            currentLocation={currentLocation}
            employeeLocations={filteredLocations}
          />
        </div>
      </Card>
    </div>
  );
}
