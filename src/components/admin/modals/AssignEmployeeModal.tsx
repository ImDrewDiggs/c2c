import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const assignmentSchema = z.object({
  house_id: z.string().min(1, "Property is required"),
  employee_id: z.string().min(1, "Employee is required"),
  status: z.enum(["pending", "assigned", "completed"]).default("assigned"),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface AssignEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignEmployeeModal({ open, onOpenChange }: AssignEmployeeModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [houses, setHouses] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const { toast } = useToast();

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      house_id: "",
      employee_id: "",
      status: "assigned",
    },
  });

  // Load houses and employees when modal opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      // Get employee roles first
      const employeeRolesResult = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "employee")
        .eq("is_active", true);

      const employeeIds = employeeRolesResult.data?.map(r => r.user_id) || [];

      const [housesResult, employeesResult] = await Promise.all([
        supabase.from("houses").select("*").limit(50),
        employeeIds.length > 0 
          ? supabase.from("profiles").select("*").in("id", employeeIds).limit(50)
          : Promise.resolve({ data: [], error: null })
      ]);

      if (housesResult.data) setHouses(housesResult.data);
      if (employeesResult.data) setEmployees(employeesResult.data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const onSubmit = async (data: AssignmentFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from("assignments")
        .insert(data as any);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee assigned successfully!",
      });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error assigning employee:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign employee",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Employee</DialogTitle>
          <DialogDescription>
            Assign an employee to a property for service.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="house_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {houses.map((house) => (
                        <SelectItem key={house.id} value={house.id}>
                          {house.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.full_name || employee.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign Employee
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}