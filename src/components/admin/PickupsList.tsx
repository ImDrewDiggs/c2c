
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

interface PickupsListProps {
  pickups: {
    id: number;
    address: string;
    status: string;
    scheduledTime: string;
    assignedTo: string;
  }[];
}

export function PickupsList({ pickups }: PickupsListProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Today's Pickups</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assigned To</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pickups.map((pickup) => (
            <TableRow key={pickup.id}>
              <TableCell className="font-medium">{pickup.address}</TableCell>
              <TableCell>{pickup.scheduledTime}</TableCell>
              <TableCell>
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
