
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

import { useVehicles, useMaintenanceSchedule } from "@/hooks/admin/useVehicles";

export default function AdminFleet() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Use real data from database
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles(searchTerm);
  const { data: maintenanceSchedule = [], isLoading: maintenanceLoading } = useMaintenanceSchedule();
  
  const filteredVehicles = vehicles;
  
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
                    {vehiclesLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          Loading vehicles...
                        </TableCell>
                      </TableRow>
                    ) : filteredVehicles.length > 0 ? (
                      filteredVehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">{vehicle.vehicle_number}</TableCell>
                          <TableCell>{vehicle.vehicle_type}</TableCell>
                          <TableCell className="hidden md:table-cell">{`${vehicle.make} ${vehicle.model}`}</TableCell>
                          <TableCell className="hidden md:table-cell">{vehicle.year}</TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              vehicle.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : vehicle.status === 'maintenance'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {vehicle.status}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {vehicle.next_maintenance_date ? new Date(vehicle.next_maintenance_date).toLocaleDateString() : 'Not scheduled'}
                          </TableCell>
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
                    {maintenanceLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Loading maintenance schedule...
                        </TableCell>
                      </TableRow>
                    ) : maintenanceSchedule.length > 0 ? (
                      maintenanceSchedule.map((maintenance) => (
                        <TableRow key={maintenance.id}>
                          <TableCell className="font-medium">
                            {maintenance.vehicles?.vehicle_number || 'Unknown Vehicle'}
                          </TableCell>
                          <TableCell>{maintenance.maintenance_type}</TableCell>
                          <TableCell>{new Date(maintenance.scheduled_date).toLocaleDateString()}</TableCell>
                          <TableCell className="hidden md:table-cell">{maintenance.vendor_name || 'Not assigned'}</TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              maintenance.status === 'scheduled' 
                                ? 'bg-blue-100 text-blue-800' 
                                : maintenance.status === 'in_progress'
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No maintenance scheduled.
                        </TableCell>
                      </TableRow>
                    )}
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
