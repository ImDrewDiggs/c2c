
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeFilters } from "./EmployeeFilters";
import { EmployeeTable } from "./EmployeeTable";
import { LocationMap } from "./LocationMap";
import { useEmployeeData } from "./useEmployeeData";
import { EmployeeLocation, Location } from "@/types/map";
import { AlertTriangle } from "lucide-react";

interface EmployeeTrackerProps {
  employeeLocations: EmployeeLocation[];
  currentLocation: Location | null;
}

export function EmployeeTracker({ employeeLocations, currentLocation }: EmployeeTrackerProps) {
  const { 
    filteredEmployees, 
    setSearchTerm, 
    setStatusFilter, 
    searchTerm, 
    statusFilter,
    error
  } = useEmployeeData(employeeLocations);

  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeLocation | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <EmployeeFilters 
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              onSearchChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
            />
          </CardContent>
        </Card>

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

      <Card className="lg:col-span-2">
        <CardContent className="pt-6">
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
