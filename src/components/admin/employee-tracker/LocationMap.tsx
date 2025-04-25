
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
  const filteredLocations = employeeLocations.filter(validateLocation);

  return (
    <>
      <h3 className="text-xl font-semibold mb-4">
        {selectedEmployee 
          ? `Tracking: Employee ${selectedEmployee.id.substring(0, 8)}...`
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
  // Check if location has direct latitude/longitude or nested in location object
  const lat = location.latitude ?? location.location?.latitude;
  const lng = location.longitude ?? location.location?.longitude;
  
  // Check for valid latitude and longitude values
  if (!location || 
      typeof lat !== 'number' || 
      typeof lng !== 'number' ||
      isNaN(lat) || 
      isNaN(lng) ||
      lat < -90 || 
      lat > 90 || 
      lng < -180 || 
      lng > 180) {
    return false;
  }
  return true;
}
