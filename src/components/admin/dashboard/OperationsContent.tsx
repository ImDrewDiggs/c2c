
import { Card } from "@/components/ui/card";
import { House, Assignment, EmployeeLocation, Location } from "@/types/map";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { PickupsList } from "@/components/admin/PickupsList";
import { OperationsMap } from "@/components/admin/OperationsMap";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  // Ensure all data is valid before rendering
  const safeHouses = Array.isArray(houses) ? houses : [];
  const safeAssignments = Array.isArray(assignments) ? assignments : [];
  const safeEmployeeLocations = Array.isArray(employeeLocations) ? employeeLocations : [];
  const safeRevenueData = Array.isArray(revenueData) ? revenueData : [];
  const safePickups = Array.isArray(pickups) ? pickups : [];

  return (
    <div className="h-full w-full overflow-y-auto pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Revenue Overview</h3>
            <RevenueChart data={safeRevenueData} />
          </Card>
          
          <PickupsList pickups={safePickups} />
        </div>
        
        <OperationsMap
          houses={safeHouses}
          assignments={safeAssignments}
          currentLocation={currentLocation}
          employeeLocations={safeEmployeeLocations}
        />
      </div>
    </div>
  );
}
