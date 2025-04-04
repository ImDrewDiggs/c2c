
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { EmployeeLocation, Location } from "@/types/map";
import { useEmployeeData } from "./useEmployeeData";
import { EmployeeFilters } from "./EmployeeFilters";
import { EmployeeTable } from "./EmployeeTable";
import { LocationMap } from "./LocationMap";
import { EmployeeData } from "./types";

interface EmployeeTrackerProps {
  employeeLocations: EmployeeLocation[];
  currentLocation: Location | null;
}

export function EmployeeTracker({ employeeLocations, currentLocation }: EmployeeTrackerProps) {
  const { employees, error } = useEmployeeData(employeeLocations);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const handleFilterChange = useCallback((filtered: EmployeeData[]) => {
    setFilteredEmployees(filtered);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getSelectedEmployeeName = () => {
    if (!selectedEmployee) return undefined;
    return employees.find(e => e.id === selectedEmployee)?.name;
  };

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

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <EmployeeFilters 
          employees={employees} 
          onFilterChange={handleFilterChange} 
        />
        
        <EmployeeTable 
          employees={filteredEmployees} 
          selectedEmployee={selectedEmployee}
          onSelectEmployee={setSelectedEmployee}
        />
      </Card>

      {/* Map for employee tracking */}
      <Card className="p-6">
        <LocationMap 
          employeeLocations={employeeLocations}
          currentLocation={currentLocation}
          selectedEmployee={selectedEmployee}
          employeeName={getSelectedEmployeeName()}
        />
      </Card>
    </div>
  );
}
