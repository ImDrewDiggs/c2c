
import { useState, useEffect } from "react";
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
  Search,
  Pencil,
  Trash2
} from "lucide-react";
import { AddEmployeeModal } from "@/components/admin/modals/AddEmployeeModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  drivers_license: string;
  pay_rate: string;
  job_title: string;
  status?: string;
}

const formSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter a valid address"),
  driversLicense: z.string().optional(),
  payRate: z.string().regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid pay rate"),
  jobTitle: z.enum(["Driver", "Can Courier", "Can Cleaner", "Supervisor", "Trainee"], {
    required_error: "Please select a job title",
  }),
  status: z.enum(["Active", "On Leave", "Inactive"], {
    required_error: "Please select a status",
  }),
});

export default function AdminEmployees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [editEmployeeOpen, setEditEmployeeOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      driversLicense: "",
      payRate: "",
      jobTitle: "Driver",
      status: "Active"
    },
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'employee');
      
      if (error) throw error;
      
      setEmployees(data as Employee[]);
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      toast({
        variant: "destructive",
        title: "Failed to load employees",
        description: error.message || "An error occurred while loading employees",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    fetchEmployees();
    toast({
      title: "Employee Added",
      description: "The employee has been added successfully.",
    });
  };

  const handleEditClick = (employee: Employee) => {
    setCurrentEmployee(employee);
    form.reset({
      fullName: employee.full_name,
      email: employee.email,
      phone: employee.phone || "",
      address: employee.address || "",
      driversLicense: employee.drivers_license || "",
      payRate: employee.pay_rate || "",
      jobTitle: employee.job_title as any || "Driver",
      status: employee.status as any || "Active"
    });
    setEditEmployeeOpen(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        fetchEmployees();
        toast({
          title: "Employee Deleted",
          description: "The employee has been deleted successfully.",
        });
      } catch (error: any) {
        console.error("Error deleting employee:", error);
        toast({
          variant: "destructive",
          title: "Failed to delete employee",
          description: error.message || "An error occurred while deleting the employee",
        });
      }
    }
  };

  const handleEditSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!currentEmployee) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          email: values.email,
          phone: values.phone,
          address: values.address,
          drivers_license: values.driversLicense,
          pay_rate: values.payRate,
          job_title: values.jobTitle,
          status: values.status
        })
        .eq('id', currentEmployee.id);
      
      if (error) throw error;
      
      fetchEmployees();
      setEditEmployeeOpen(false);
      toast({
        title: "Employee Updated",
        description: "The employee information has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating employee:", error);
      toast({
        variant: "destructive",
        title: "Failed to update employee",
        description: error.message || "An error occurred while updating the employee",
      });
    }
  };
  
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <TableHead>Job Title</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="hidden lg:table-cell">Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading employees...
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.full_name}</TableCell>
                    <TableCell>{employee.job_title || "Driver"}</TableCell>
                    <TableCell className="hidden md:table-cell">{employee.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{employee.phone}</TableCell>
                    <TableCell className="hidden lg:table-cell">{employee.address || "Not provided"}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        employee.status === 'Active' || !employee.status 
                          ? 'bg-green-100 text-green-800' 
                          : employee.status === 'On Leave' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.status || "Active"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditClick(employee)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-destructive hover:text-destructive/80"
                          onClick={() => handleDeleteClick(employee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
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

      <Dialog open={editEmployeeOpen} onOpenChange={setEditEmployeeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleEditSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="col-span-3" />
                    </FormControl>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className="col-span-3" />
                    </FormControl>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Phone</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" className="col-span-3" />
                    </FormControl>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Address</FormLabel>
                    <FormControl>
                      <Input {...field} className="col-span-3" />
                    </FormControl>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="driversLicense"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Driver's License</FormLabel>
                    <FormControl>
                      <Input {...field} className="col-span-3" />
                    </FormControl>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="payRate"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Pay Rate ($)</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" className="col-span-3" />
                    </FormControl>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Job Title</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="Driver">Driver</option>
                        <option value="Can Courier">Can Courier</option>
                        <option value="Can Cleaner">Can Cleaner</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Trainee">Trainee</option>
                      </select>
                    </FormControl>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-4 items-center gap-4">
                    <FormLabel className="text-right">Status</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </FormControl>
                    <FormMessage className="col-span-3 col-start-2" />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditEmployeeOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Update Employee
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
}
