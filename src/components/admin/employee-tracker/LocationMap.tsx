
import { AlertTriangle, Clock } from "lucide-react";
import Map from "@/components/Map/Map";
import { Location, EmployeeLocation } from "@/types/map";

interface LocationMapProps {
  employeeLocations: EmployeeLocation[];
  currentLocation: Location | null;
  selectedEmployee: EmployeeLocation | null;
}

export function LocationMap({ 
  employeeLocations, 
  currentLocation, 
  selectedEmployee
}: LocationMapProps) {
  // Filter locations to only show selected employee if one is selected
  const filteredLocations = selectedEmployee
    ? employeeLocations.filter(loc => validateLocation(loc) && loc.employee_id === selectedEmployee.employee_id)
    : employeeLocations.filter(validateLocation);

  return (
    <>
      <h3 className="text-xl font-semibold mb-4">
        {selectedEmployee 
          ? `Tracking: ${selectedEmployee.employee_name || 'Employee'}`
          : 'Employee Locations'}
      </h3>
      <div className="h-[400px]">
        {!currentLocation ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Unable to access your current location</span>
          </div>
        ) : (
          <Map
            houses={[]}
            assignments={[]}
            currentLocation={currentLocation}
            employeeLocations={filteredLocations}
          />
        )}
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            Map updates automatically. Last refresh: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </>
  );
}

// Validate location data
function validateLocation(location: EmployeeLocation): boolean {
  // Check for valid latitude and longitude values
  if (!location || 
      typeof location.latitude !== 'number' || 
      typeof location.longitude !== 'number' ||
      isNaN(location.latitude) || 
      isNaN(location.longitude) ||
      location.latitude < -90 || 
      location.latitude > 90 || 
      location.longitude < -180 || 
      location.longitude > 180) {
    return false;
  }
  return true;
}
