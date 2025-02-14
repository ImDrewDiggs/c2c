
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface Pickup {
  id: number;
  address: string;
  status: string;
  scheduledTime: string;
  assignedTo: string;
}

interface PickupsTableProps {
  pickups: Pickup[];
}

export function PickupsTable({ pickups }: PickupsTableProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Recent Pickups</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Address</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Employee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pickups.map((pickup) => (
            <TableRow key={pickup.id}>
              <TableCell>{pickup.address}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    pickup.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {pickup.status}
                </span>
              </TableCell>
              <TableCell>{pickup.scheduledTime}</TableCell>
              <TableCell>{pickup.assignedTo}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
