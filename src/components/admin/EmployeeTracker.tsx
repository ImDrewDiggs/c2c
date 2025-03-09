
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
import { Input } from "@/components/ui/input";
import { MapPin, RefreshCw, Clock, Search, Filter } from "lucide-react";
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
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

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
            name: profile?.full_name || `Employee ID: ${location.employee_id.substring(0, 8)}...`,
            startTime: new Date(location.timestamp || new Date()).toLocaleTimeString(),
            status: location.is_online ? 'active' : 'inactive',
            lastActive: new Date(location.last_seen_at || new Date()).toLocaleString(),
            location: location
          };
        });

        setEmployees(employeeData);
        setFilteredEmployees(employeeData);
      }
    }

    fetchEmployeeData();
  }, [employeeLocations]);

  // Filter employees based on search and status filter
  useEffect(() => {
    let filtered = employees;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
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
  }, [searchQuery, statusFilter, employees]);

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

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={statusFilter === "all" ? "default" : "outline"} 
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button 
              variant={statusFilter === "active" ? "default" : "outline"} 
              size="sm"
              onClick={() => setStatusFilter("active")}
              className={statusFilter === "active" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              Active
            </Button>
            <Button 
              variant={statusFilter === "inactive" ? "default" : "outline"} 
              size="sm"
              onClick={() => setStatusFilter("inactive")}
              className={statusFilter === "inactive" ? "bg-gray-500 hover:bg-gray-600" : ""}
            >
              Inactive
            </Button>
          </div>
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
            {filteredEmployees.map((employee) => (
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
            {filteredEmployees.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                  {employees.length === 0 ? 'No active employees found' : 'No employees match your filters'}
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

        <div className="mt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              Map updates automatically. Last refresh: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
