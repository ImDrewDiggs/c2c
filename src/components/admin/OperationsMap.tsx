
import { Card } from "@/components/ui/card";
import Map from "@/components/Map/Map";
import { House, Assignment, EmployeeLocation, Location } from "@/types/map";

/**
 * Props interface for OperationsMap component
 */
interface OperationsMapProps {
  houses: House[];                 // Client house locations
  assignments: Assignment[];       // Task assignments
  currentLocation: Location | null; // User's current location
  employeeLocations: EmployeeLocation[]; // Employee GPS positions
}

/**
 * OperationsMap - Displays an interactive map of operations
 * 
 * Shows the locations of houses, employees, and the current user
 * on a map for operational oversight and planning.
 */
export function OperationsMap({
  houses,
  assignments,
  currentLocation,
  employeeLocations,
}: OperationsMapProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Live Operations Map</h3>
      {/* Map container with fixed height */}
      <div className="h-[400px]">
        <Map
          houses={houses}
          assignments={assignments}
          currentLocation={currentLocation}
          employeeLocations={employeeLocations}
        />
      </div>
    </Card>
  );
}
