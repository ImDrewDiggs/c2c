
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeFilters } from "./EmployeeFilters";
import { EmployeeTable } from "./EmployeeTable";
import { LocationMap } from "./LocationMap";
import { useEmployeeData } from "./useEmployeeData";
import { EmployeeLocation, Location } from "@/types/map";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

/**
 * Props interface for EmployeeTracker component
 */
interface EmployeeTrackerProps {
  employeeLocations: EmployeeLocation[]; // Array of employee GPS positions
  currentLocation: Location | null;      // Current user's location
}

/**
 * EmployeeTracker - Main component for employee location tracking
 * 
 * Provides a UI for monitoring employee locations on a map,
 * filtering employees, and viewing their status.
 */
export function EmployeeTracker({ employeeLocations = [], currentLocation = null }: EmployeeTrackerProps) {
  console.log("Original EmployeeTracker component rendering with:", { employeeLocations });
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  
  // Get employee data with filtering capabilities
  const { 
    filteredEmployees, 
    setSearchTerm, 
    setStatusFilter, 
    searchTerm, 
    statusFilter,
    error
  } = useEmployeeData(employeeLocations);

  // State for tracking a specific employee
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeLocation | null>(null);

  // Handle manual refresh of employee locations
  const handleRefresh = () => {
    setRefreshing(true);
    // In a real implementation, this would trigger a refresh of location data
    // For this demo, we'll simulate a refresh with a timeout
    setTimeout(() => {
      setRefreshing(false);
      toast({
        title: "Locations Updated",
        description: "Employee location data has been refreshed.",
      });
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column: filters and employee list */}
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle>Employee Tracking</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error message display if there's an issue with employee data */}
            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            {/* Search and filter controls */}
            <EmployeeFilters 
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              onSearchChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
            />
          </CardContent>
        </Card>

        {/* Employee data table */}
        <Card>
          <CardContent className="pt-6">
            <EmployeeTable 
              employees={filteredEmployees} 
              onSelect={(employee) => {
                if (employee) {
                  setSelectedEmployee(employee.location);
                } else {
                  setSelectedEmployee(null);
                }
              }}
              selectedEmployeeId={selectedEmployee?.employee_id}
            />
          </CardContent>
        </Card>
      </div>

      {/* Right column: map display */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle>Live Location Map</CardTitle>
        </CardHeader>
        <CardContent>
          <LocationMap 
            employeeLocations={employeeLocations.filter(loc => 
              // Show all if no selection, or only the selected one
              !selectedEmployee || loc.employee_id === selectedEmployee.employee_id
            )}
            currentLocation={currentLocation}
            selectedEmployee={selectedEmployee}
          />
        </CardContent>
      </Card>
    </div>
  );
}
