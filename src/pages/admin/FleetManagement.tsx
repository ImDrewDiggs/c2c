import { useState, useEffect } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Search, Wrench, Truck, AlertTriangle, Calendar as CalendarLucide } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Vehicle {
  id: string;
  vehicle_number: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vehicle_type: string;
  status: string;
  fuel_type: string;
  mileage: number;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
}

interface MaintenanceSchedule {
  id: string;
  vehicle_id: string;
  maintenance_type: string;
  description: string;
  scheduled_date: string;
  completed_date?: string;
  cost?: number;
  status: string;
  vendor_name?: string;
  vehicle?: Vehicle;
}

const vehicleSchema = z.object({
  vehicle_number: z.string().min(1, "Vehicle number is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1990, "Year must be 1990 or later").max(new Date().getFullYear() + 1),
  license_plate: z.string().min(1, "License plate is required"),
  vin: z.string().optional(),
  vehicle_type: z.enum(["truck", "van", "car", "trailer"]),
  fuel_type: z.enum(["diesel", "gasoline", "electric", "hybrid"]),
  capacity_cubic_yards: z.number().optional(),
  mileage: z.number().min(0, "Mileage must be positive"),
});

const maintenanceSchema = z.object({
  vehicle_id: z.string().min(1, "Vehicle is required"),
  maintenance_type: z.enum(["oil_change", "tire_rotation", "brake_inspection", "transmission_service", "annual_inspection", "repairs", "other"]),
  description: z.string().min(1, "Description is required"),
  scheduled_date: z.date(),
  cost: z.number().optional(),
  vendor_name: z.string().optional(),
  vendor_contact: z.string().optional(),
});

export default function FleetManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceSchedules, setMaintenanceSchedules] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false);
  const { toast } = useToast();

  const vehicleForm = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicle_type: "truck",
      fuel_type: "diesel",
      mileage: 0,
    },
  });

  const maintenanceForm = useForm<z.infer<typeof maintenanceSchema>>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      maintenance_type: "oil_change",
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (vehiclesError) throw vehiclesError;
      setVehicles(vehiclesData || []);

      // Fetch maintenance schedules with vehicle data
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from('maintenance_schedules')
        .select(`
          *,
          vehicle:vehicles(*)
        `)
        .order('scheduled_date', { ascending: true });
      
      if (maintenanceError) throw maintenanceError;
      setMaintenanceSchedules(maintenanceData || []);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (values: z.infer<typeof vehicleSchema>) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .insert({
          vehicle_number: values.vehicle_number,
          make: values.make,
          model: values.model,
          year: values.year,
          license_plate: values.license_plate,
          vin: values.vin,
          vehicle_type: values.vehicle_type,
          fuel_type: values.fuel_type,
          capacity_cubic_yards: values.capacity_cubic_yards,
          mileage: values.mileage,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle added successfully",
      });

      vehicleForm.reset();
      setIsAddVehicleOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add vehicle",
      });
    }
  };

  const handleAddMaintenance = async (values: z.infer<typeof maintenanceSchema>) => {
    try {
      const { error } = await supabase
        .from('maintenance_schedules')
        .insert({
          vehicle_id: values.vehicle_id,
          maintenance_type: values.maintenance_type,
          description: values.description,
          scheduled_date: values.scheduled_date.toISOString().split('T')[0],
          cost: values.cost,
          vendor_name: values.vendor_name,
          vendor_contact: values.vendor_contact,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Maintenance scheduled successfully",
      });

      maintenanceForm.reset();
      setIsAddMaintenanceOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to schedule maintenance",
      });
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_service': return 'bg-red-100 text-red-800';
      case 'retired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminPageLayout 
      title="Fleet Management" 
      description="Manage vehicles and maintenance schedules"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Vehicles</p>
                  <p className="text-3xl font-bold">{vehicles.length}</p>
                </div>
                <Truck className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active</p>
                  <p className="text-3xl font-bold text-green-600">
                    {vehicles.filter(v => v.status === 'active').length}
                  </p>
                </div>
                <Truck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {vehicles.filter(v => v.status === 'maintenance').length}
                  </p>
                </div>
                <Wrench className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Due Maintenance</p>
                  <p className="text-3xl font-bold text-red-600">
                    {maintenanceSchedules.filter(m => 
                      m.status === 'scheduled' && 
                      new Date(m.scheduled_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    ).length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="vehicles">
          <TabsList>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vehicles..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Vehicle
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Add New Vehicle</DialogTitle>
                  </DialogHeader>
                  <Form {...vehicleForm}>
                    <form onSubmit={vehicleForm.handleSubmit(handleAddVehicle)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={vehicleForm.control}
                          name="vehicle_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vehicle Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={vehicleForm.control}
                          name="license_plate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>License Plate</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={vehicleForm.control}
                          name="make"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Make</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={vehicleForm.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Model</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={vehicleForm.control}
                          name="year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Year</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={vehicleForm.control}
                          name="mileage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mileage</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={vehicleForm.control}
                          name="vehicle_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vehicle Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="truck">Truck</SelectItem>
                                  <SelectItem value="van">Van</SelectItem>
                                  <SelectItem value="car">Car</SelectItem>
                                  <SelectItem value="trailer">Trailer</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={vehicleForm.control}
                          name="fuel_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fuel Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="diesel">Diesel</SelectItem>
                                  <SelectItem value="gasoline">Gasoline</SelectItem>
                                  <SelectItem value="electric">Electric</SelectItem>
                                  <SelectItem value="hybrid">Hybrid</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddVehicleOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Add Vehicle</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle #</TableHead>
                    <TableHead>Make/Model</TableHead>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading vehicles...
                      </TableCell>
                    </TableRow>
                  ) : filteredVehicles.length > 0 ? (
                    filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.vehicle_number}</TableCell>
                        <TableCell>{vehicle.make} {vehicle.model} ({vehicle.year})</TableCell>
                        <TableCell>{vehicle.license_plate}</TableCell>
                        <TableCell className="capitalize">{vehicle.vehicle_type}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(vehicle.status)}>
                            {vehicle.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{vehicle.mileage?.toLocaleString()} mi</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No vehicles found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isAddMaintenanceOpen} onOpenChange={setIsAddMaintenanceOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule Maintenance
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Schedule Maintenance</DialogTitle>
                  </DialogHeader>
                  <Form {...maintenanceForm}>
                    <form onSubmit={maintenanceForm.handleSubmit(handleAddMaintenance)} className="space-y-4">
                      <FormField
                        control={maintenanceForm.control}
                        name="vehicle_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select vehicle" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {vehicles.map((vehicle) => (
                                  <SelectItem key={vehicle.id} value={vehicle.id}>
                                    {vehicle.vehicle_number} - {vehicle.make} {vehicle.model}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={maintenanceForm.control}
                        name="maintenance_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maintenance Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="oil_change">Oil Change</SelectItem>
                                <SelectItem value="tire_rotation">Tire Rotation</SelectItem>
                                <SelectItem value="brake_inspection">Brake Inspection</SelectItem>
                                <SelectItem value="transmission_service">Transmission Service</SelectItem>
                                <SelectItem value="annual_inspection">Annual Inspection</SelectItem>
                                <SelectItem value="repairs">Repairs</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={maintenanceForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={maintenanceForm.control}
                        name="scheduled_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Scheduled Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={`w-full pl-3 text-left font-normal ${
                                      !field.value && "text-muted-foreground"
                                    }`}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsAddMaintenanceOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Schedule</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading maintenance schedules...
                      </TableCell>
                    </TableRow>
                  ) : maintenanceSchedules.length > 0 ? (
                    maintenanceSchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          {schedule.vehicle ? 
                            `${schedule.vehicle.vehicle_number} - ${schedule.vehicle.make} ${schedule.vehicle.model}` : 
                            'Unknown Vehicle'
                          }
                        </TableCell>
                        <TableCell className="capitalize">
                          {schedule.maintenance_type.replace('_', ' ')}
                        </TableCell>
                        <TableCell>{schedule.description}</TableCell>
                        <TableCell>{format(new Date(schedule.scheduled_date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <Badge className={
                            schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                            schedule.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {schedule.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No maintenance schedules found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarLucide className="mr-2 h-5 w-5" />
                  Maintenance Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-6 text-center text-muted-foreground">
                  Maintenance calendar view would be implemented here using a calendar component.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}