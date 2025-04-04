
import { useState } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  User,
  UserPlus,
  Mail,
  Phone,
  Search
} from "lucide-react";
import { AddEmployeeModal } from "@/components/admin/modals/AddEmployeeModal";
import { useToast } from "@/hooks/use-toast";

export default function AdminEmployees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const { toast } = useToast();
  
  // Mock data - would be replaced with actual data from Supabase
  const employees = [
    { id: 1, name: "John Doe", email: "john@example.com", phone: "555-123-4567", role: "Driver", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "555-765-4321", role: "Driver", status: "Active" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", phone: "555-987-6543", role: "Supervisor", status: "Active" },
    { id: 4, name: "Sarah Williams", email: "sarah@example.com", phone: "555-456-7890", role: "Driver", status: "On Leave" },
    { id: 5, name: "Mike Brown", email: "mike@example.com", phone: "555-321-6547", role: "Driver", status: "Inactive" },
  ];
  
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSuccess = () => {
    toast({
      title: "Employee Added",
      description: "The employee has been added successfully. Refresh to see updates.",
    });
  };
  
  return (
    <AdminPageLayout 
      title="Manage Employees" 
      description="Add, edit, and manage employee accounts"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button onClick={() => setAddEmployeeOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{employee.phone}</TableCell>
                    <TableCell className="hidden md:table-cell">{employee.role}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        employee.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : employee.status === 'On Leave' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => {
                        toast({
                          title: "Edit Employee",
                          description: `Editing ${employee.name}. This functionality is coming soon.`,
                        });
                      }}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No employees found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddEmployeeModal 
        open={addEmployeeOpen} 
        onOpenChange={setAddEmployeeOpen}
        onSuccess={handleAddSuccess}
      />
    </AdminPageLayout>
  );
}
