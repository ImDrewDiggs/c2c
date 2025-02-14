
import { Card } from "@/components/ui/card";
import Map from "@/components/Map/Map";
import { House, Assignment, EmployeeLocation, Location } from "@/types/map";

interface OperationsMapProps {
  houses: House[];
  assignments: Assignment[];
  currentLocation: Location | null;
  employeeLocations: EmployeeLocation[];
}

export function OperationsMap({
  houses,
  assignments,
  currentLocation,
  employeeLocations,
}: OperationsMapProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Live Operations Map</h3>
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
