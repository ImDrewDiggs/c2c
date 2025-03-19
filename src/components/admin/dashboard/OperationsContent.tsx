
import { House, Assignment, EmployeeLocation, Location } from "@/types/map";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { PickupsTable } from "@/components/admin/PickupsTable";
import { OperationsMap } from "@/components/admin/OperationsMap";
import { useEffect } from "react";

interface OperationsContentProps {
  houses: House[];
  assignments: Assignment[];
  currentLocation: Location | null;
  employeeLocations: EmployeeLocation[];
  revenueData: { name: string; amount: number }[];
  pickups: { id: number; address: string; status: string; scheduledTime: string; assignedTo: string }[];
}

export function OperationsContent({ 
  houses, 
  assignments, 
  currentLocation, 
  employeeLocations,
  revenueData,
  pickups
}: OperationsContentProps) {
  // Log component rendering for debugging purposes
  useEffect(() => {
    console.log('[OperationsContent] Rendering with data:', {
      housesCount: houses.length,
      assignmentsCount: assignments.length,
      hasCurrentLocation: !!currentLocation,
      employeeLocationsCount: employeeLocations.length
    });
  }, [houses, assignments, currentLocation, employeeLocations]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PickupsTable pickups={pickups} />
        <RevenueChart data={revenueData} />
      </div>

      <OperationsMap
        houses={houses}
        assignments={assignments}
        currentLocation={currentLocation}
        employeeLocations={employeeLocations}
      />
    </>
  );
}
