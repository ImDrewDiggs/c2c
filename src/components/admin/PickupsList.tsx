
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

/**
 * Props interface for PickupsList component
 */
interface PickupsListProps {
  pickups: {
    id: number;            // Unique identifier for the pickup
    address: string;       // Location of the pickup
    status: string;        // Current status (Pending, Completed, etc.)
    scheduledTime: string; // Time the pickup is scheduled for
    assignedTo: string;    // Employee assigned to the pickup
  }[];
}

/**
 * PickupsList - Displays a table of today's scheduled pickups
 * 
 * Shows pickup details including address, time, status, and assigned employee.
 * Uses a color-coded badge to indicate status.
 */
export function PickupsList({ pickups }: PickupsListProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Today's Pickups</h3>
      <Table>
        {/* Table header */}
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
          </TableRow>
        </TableHeader>
        {/* Table body with pickup data */}
        <TableBody>
          {pickups.map((pickup) => (
            <TableRow key={pickup.id}>
              <TableCell className="font-medium">{pickup.address}</TableCell>
              <TableCell>{pickup.scheduledTime}</TableCell>
              <TableCell>
                {/* Color-coded status badge */}
                <Badge
                  variant={pickup.status === "Completed" ? "success" : "warning"}
                  className={pickup.status === "Completed" ? "bg-green-600" : "bg-yellow-600"}
                >
                  {pickup.status}
                </Badge>
              </TableCell>
              <TableCell>{pickup.assignedTo}</TableCell>
            </TableRow>
          ))}
          {/* Empty state message when no pickups are available */}
          {pickups.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                No pickups scheduled for today
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
