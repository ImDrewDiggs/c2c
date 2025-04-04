
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { EmployeeData } from "./types";

interface EmployeeTableProps {
  employees: EmployeeData[];
  selectedEmployee: string | null;
  onSelectEmployee: (id: string | null) => void;
}

export function EmployeeTable({ employees, selectedEmployee, onSelectEmployee }: EmployeeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          <TableHead>Start Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Activity</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id} className={selectedEmployee === employee.id ? 'bg-accent/20' : ''}>
            <TableCell className="font-medium">{employee.name}</TableCell>
            <TableCell>{employee.startTime}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs ${
                employee.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {employee.status === 'active' ? 'On Duty' : 'Offline'}
              </span>
            </TableCell>
            <TableCell>{employee.lastActive}</TableCell>
            <TableCell>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  if (selectedEmployee === employee.id) {
                    onSelectEmployee(null);
                  } else {
                    onSelectEmployee(employee.id);
                  }
                }}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {selectedEmployee === employee.id ? 'Show All' : 'Track'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {employees.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4 text-gray-500">
              No employees match your filters
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
