
import { Card } from "@/components/ui/card";
import { House, Assignment, EmployeeLocation, Location } from "@/types/map";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { PickupsList } from "@/components/admin/PickupsList";
import { OperationsMap } from "@/components/admin/OperationsMap";

/**
 * Props interface for the OperationsContent component
 * Contains all the data needed to display operations information
 */
interface OperationsContentProps {
  houses: House[];                 // List of client houses/locations
  assignments: Assignment[];       // Employee task assignments
  currentLocation: Location | null; // User's current location for map centering
  employeeLocations: EmployeeLocation[]; // Real-time employee GPS positions
  revenueData: { name: string; amount: number }[]; // Revenue chart data by day
  pickups: { id: number; address: string; status: string; scheduledTime: string; assignedTo: string }[]; // Today's scheduled pickups
}

/**
 * OperationsContent - Displays the main operations dashboard view
 * Shows revenue data, pickups list, and operations map in a responsive grid layout
 */
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
    <div className="h-full w-full overflow-auto pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Revenue chart and pickups list */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Revenue Overview</h3>
            <RevenueChart data={safeRevenueData} />
          </Card>
          
          <PickupsList pickups={safePickups} />
        </div>
        
        {/* Right column: Operations map with employee and house locations */}
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
