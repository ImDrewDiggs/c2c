
import { AlertTriangle, Clock } from "lucide-react";
import Map from "@/components/Map/Map";
import { Location, EmployeeLocation } from "@/types/map";

/**
 * Props interface for LocationMap component
 */
interface LocationMapProps {
  employeeLocations: EmployeeLocation[]; // Array of employee GPS positions
  currentLocation: Location | null;      // Current user's location
  selectedEmployee: EmployeeLocation | null; // Currently selected employee for focused tracking
}

/**
 * LocationMap - Displays employees on an interactive map
 * 
 * Shows all employee locations or focuses on a single selected employee.
 * Provides a timestamp for the last map update.
 */
export function LocationMap({ 
  employeeLocations, 
  currentLocation, 
  selectedEmployee
}: LocationMapProps) {
  // Filter locations to only show valid ones
  const filteredLocations = employeeLocations.filter(validateLocation);

  return (
    <>
      <h3 className="text-xl font-semibold mb-4">
        {selectedEmployee 
          ? `Tracking: Employee ${selectedEmployee.employee_id.substring(0, 8)}...`
          : 'Employee Locations'}
      </h3>
      <div className="h-[400px]">
        {/* Show error message if user location is not available */}
        {!currentLocation ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Unable to access your current location</span>
          </div>
        ) : (
          /* Show map with employee locations */
          <Map
            houses={[]}
            assignments={[]}
            currentLocation={currentLocation}
            employeeLocations={filteredLocations}
          />
        )}
      </div>

      {/* Last updated timestamp */}
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

/**
 * Helper function to validate location data
 * Ensures coordinates are valid before attempting to display on map
 */
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
