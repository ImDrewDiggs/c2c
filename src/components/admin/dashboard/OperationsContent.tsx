
import { Card } from "@/components/ui/card";
import { House, Assignment, EmployeeLocation, Location } from "@/types/map";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { PickupsList } from "@/components/admin/PickupsList";
import { OperationsMap } from "@/components/admin/OperationsMap";

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
  pickups,
}: OperationsContentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Revenue Overview</h3>
          <RevenueChart data={revenueData} />
        </Card>
        
        <PickupsList pickups={pickups} />
      </div>
      
      <OperationsMap
        houses={houses}
        assignments={assignments}
        currentLocation={currentLocation}
        employeeLocations={employeeLocations}
      />
    </div>
  );
}
