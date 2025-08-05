
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertCircle } from "lucide-react";

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Enhanced validation schema with more specific requirements
const formSchema = z.object({
  fullName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s\-'.]+$/, "Name can only contain letters, spaces, hyphens, apostrophes, and periods"),
  
  email: z.string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  
  phone: z.string()
    .min(6, "Please enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[0-9\+\-\(\)\s]+$/, "Please enter a valid phone number format"),
  
  address: z.string()
    .min(5, "Please enter a valid address")
    .max(255, "Address must be less than 255 characters"),
  
  driversLicense: z.string()
    .optional()
    .transform(val => val || "")
    .refine(val => val === "" || /^[A-Z0-9\-]+$/.test(val), {
      message: "Driver's license must contain only letters, numbers, and hyphens",
    }),
  
  payRate: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid pay rate format (e.g., 15.50)")
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num < 1000;
    }, "Pay rate must be between 0 and 1000"),
  
  jobTitle: z.enum(["Driver", "Can Courier", "Can Cleaner", "Supervisor", "Trainee"], {
    required_error: "Please select a job title",
  }),
});

export function AddEmployeeModal({ open, onOpenChange, onSuccess }: AddEmployeeModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
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
      jobTitle: "Driver"
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      setGeneralError(null);
      console.log("Submitting employee data:", values);

      // Additional validation before submitting
      if (parseFloat(values.payRate) <= 0) {
        throw new Error("Pay rate must be greater than zero");
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert({
            full_name: values.fullName, 
            email: values.email,
            phone: values.phone,
            address: values.address,
            drivers_license: values.driversLicense,
            pay_rate: parseFloat(values.payRate),
            job_title: values.jobTitle,
            role: 'employee',
            status: 'active'
        });

      if (error) {
        console.error("Supabase error:", error);
        
        // Check for specific error types
        if (error.code === '23505') {
          throw new Error("An employee with this email already exists");
        } else if (error.code === '23503') {
          throw new Error("Invalid reference in employee data");
        } else {
          throw error;
        }
      }

      toast({
        title: "Employee Added",
        description: `${values.fullName} has been added successfully.`,
      });
      
      form.reset();
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Error adding employee:", error);
      setGeneralError(error.message || "An error occurred while adding the employee");
      toast({
        variant: "destructive",
        title: "Failed to add employee",
        description: error.message || "An error occurred while adding the employee",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        // Reset form and errors when closing
        form.reset();
        setGeneralError(null);
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        
        {generalError && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <p className="text-sm">{generalError}</p>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
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
                    <Input {...field} type="text" className="col-span-3" placeholder="0.00" />
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
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Employee"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
