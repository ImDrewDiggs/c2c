
import { useState } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search,
  Plus,
  Truck,
  Calendar,
  AlertTriangle
} from "lucide-react";

export default function AdminFleet() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data for fleet vehicles
  const vehicles = [
    { id: 1, name: "Truck 101", type: "Compactor", model: "Mack TerraPro", year: "2023", status: "Active", lastMaintenance: "2025-03-15", nextMaintenance: "2025-05-15" },
    { id: 2, name: "Truck 102", type: "Compactor", model: "Mack TerraPro", year: "2023", status: "Active", lastMaintenance: "2025-03-10", nextMaintenance: "2025-05-10" },
    { id: 3, name: "Truck 103", type: "Roll-Off", model: "Peterbilt 520", year: "2022", status: "Active", lastMaintenance: "2025-02-28", nextMaintenance: "2025-04-28" },
    { id: 4, name: "Truck 104", type: "Rear Loader", model: "Freightliner M2", year: "2021", status: "Maintenance", lastMaintenance: "2025-04-01", nextMaintenance: "2025-06-01" },
    { id: 5, name: "Truck 105", type: "Front Loader", model: "Peterbilt 520", year: "2022", status: "Active", lastMaintenance: "2025-03-20", nextMaintenance: "2025-05-20" },
  ];
  
  // Mock data for maintenance schedule
  const maintenanceSchedule = [
    { id: 1, vehicleId: 4, vehicleName: "Truck 104", type: "Routine Service", scheduled: "2025-04-04", status: "In Progress", assignedTo: "Service Center A" },
    { id: 2, vehicleId: 2, vehicleName: "Truck 102", type: "Oil Change", scheduled: "2025-05-10", status: "Scheduled", assignedTo: "Service Center B" },
    { id: 3, vehicleId: 1, vehicleName: "Truck 101", type: "Brake Inspection", scheduled: "2025-05-15", status: "Scheduled", assignedTo: "Service Center A" },
    { id: 4, vehicleId: 3, vehicleName: "Truck 103", type: "Hydraulic System", scheduled: "2025-04-28", status: "Scheduled", assignedTo: "Service Center C" },
    { id: 5, vehicleId: 5, vehicleName: "Truck 105", type: "Tire Rotation", scheduled: "2025-05-20", status: "Scheduled", assignedTo: "Service Center B" },
  ];
  
  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <AdminPageLayout 
      title="Fleet Management" 
      description="Manage waste collection vehicles"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fleet..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
        </div>
        
        <Tabs defaultValue="vehicles">
          <TabsList>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vehicles" className="pt-4">
            <Card>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="hidden md:table-cell">Model</TableHead>
                      <TableHead className="hidden md:table-cell">Year</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Next Maintenance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.length > 0 ? (
                      filteredVehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">{vehicle.name}</TableCell>
                          <TableCell>{vehicle.type}</TableCell>
                          <TableCell className="hidden md:table-cell">{vehicle.model}</TableCell>
                          <TableCell className="hidden md:table-cell">{vehicle.year}</TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              vehicle.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {vehicle.status}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{vehicle.nextMaintenance}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button size="sm" variant="ghost">View</Button>
                            <Button size="sm" variant="ghost">Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No vehicles found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="maintenance" className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Maintenance Schedule</h3>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendar View
                </Button>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule Maintenance
                </Button>
              </div>
            </div>
            
            <Card>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Scheduled Date</TableHead>
                      <TableHead className="hidden md:table-cell">Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceSchedule.map((maintenance) => (
                      <TableRow key={maintenance.id}>
                        <TableCell className="font-medium">{maintenance.vehicleName}</TableCell>
                        <TableCell>{maintenance.type}</TableCell>
                        <TableCell>{maintenance.scheduled}</TableCell>
                        <TableCell className="hidden md:table-cell">{maintenance.assignedTo}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            maintenance.status === 'Scheduled' 
                              ? 'bg-blue-100 text-blue-800' 
                              : maintenance.status === 'In Progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {maintenance.status}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost">Edit</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="pt-4">
            <Card>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-4">
                    <div className="flex flex-col items-center">
                      <Truck className="h-8 w-8 text-primary mb-2" />
                      <h3 className="text-xl font-medium">Fleet Utilization</h3>
                      <p className="text-3xl font-bold mt-2">87%</p>
                      <p className="text-sm text-muted-foreground">Average across all vehicles</p>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex flex-col items-center">
                      <Calendar className="h-8 w-8 text-primary mb-2" />
                      <h3 className="text-xl font-medium">Days in Service</h3>
                      <p className="text-3xl font-bold mt-2">28.3</p>
                      <p className="text-sm text-muted-foreground">Average per month</p>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex flex-col items-center">
                      <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
                      <h3 className="text-xl font-medium">Breakdown Rate</h3>
                      <p className="text-3xl font-bold mt-2">2.4%</p>
                      <p className="text-sm text-muted-foreground">Last 30 days</p>
                    </div>
                  </Card>
                </div>
                
                <div className="mt-8 text-center">
                  <p className="text-muted-foreground">Fleet analytics visualization would appear here.</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}
