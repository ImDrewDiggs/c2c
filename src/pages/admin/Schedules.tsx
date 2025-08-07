
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Calendar,
  Filter,
  Search
} from "lucide-react";
import { NewPickupModal } from "@/components/admin/modals/NewPickupModal";

export default function AdminSchedules() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data for upcoming pickups
  const upcomingPickups = [
    { id: 1, address: "123 Main St", date: "2025-04-05", time: "9:00 AM", customer: "John Smith", employee: "Alex Johnson", status: "Scheduled" },
    { id: 2, address: "456 Pine Dr", date: "2025-04-05", time: "10:30 AM", customer: "Sarah Brown", employee: "Alex Johnson", status: "Scheduled" },
    { id: 3, address: "789 Oak Ln", date: "2025-04-05", time: "1:15 PM", customer: "Mike Wilson", employee: "Dave Miller", status: "Scheduled" },
    { id: 4, address: "101 Cedar Ct", date: "2025-04-06", time: "8:45 AM", customer: "Emily Davis", employee: "Dave Miller", status: "Scheduled" },
    { id: 5, address: "202 Elm St", date: "2025-04-06", time: "11:00 AM", customer: "Robert Jones", employee: "Chris Taylor", status: "Scheduled" },
  ];
  
  // Mock data for completed pickups
  const completedPickups = [
    { id: 6, address: "303 Maple Ave", date: "2025-04-03", time: "9:30 AM", customer: "Lisa Martin", employee: "Alex Johnson", status: "Completed" },
    { id: 7, address: "404 Birch Rd", date: "2025-04-03", time: "2:00 PM", customer: "David Clark", employee: "Dave Miller", status: "Completed" },
    { id: 8, address: "505 Walnut Blvd", date: "2025-04-02", time: "10:15 AM", customer: "Jennifer White", employee: "Chris Taylor", status: "Completed" },
    { id: 9, address: "606 Spruce Way", date: "2025-04-02", time: "3:30 PM", customer: "Daniel Garcia", employee: "Alex Johnson", status: "Completed" },
    { id: 10, address: "707 Redwood Dr", date: "2025-04-01", time: "11:45 AM", customer: "Karen Lopez", employee: "Dave Miller", status: "Completed" },
  ];
  
  const filteredUpcomingPickups = upcomingPickups.filter(
    (pickup) =>
      pickup.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickup.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickup.employee.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredCompletedPickups = completedPickups.filter(
    (pickup) =>
      pickup.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickup.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pickup.employee.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <AdminPageLayout 
      title="Schedules" 
      description="View and manage collection schedules"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search schedules..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Calendar View
            </Button>
            <NewPickupModal onSuccess={() => window.location.reload()} />
          </div>
        </div>
        
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="pt-4">
            <Card>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="hidden md:table-cell">Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Assigned To</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUpcomingPickups.length > 0 ? (
                      filteredUpcomingPickups.map((pickup) => (
                        <TableRow key={pickup.id}>
                          <TableCell className="font-medium">{pickup.address}</TableCell>
                          <TableCell>{pickup.date}</TableCell>
                          <TableCell>{pickup.time}</TableCell>
                          <TableCell className="hidden md:table-cell">{pickup.customer}</TableCell>
                          <TableCell className="hidden md:table-cell">{pickup.employee}</TableCell>
                          <TableCell>
                            <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                              {pickup.status}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost">Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No upcoming pickups found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="completed" className="pt-4">
            <Card>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="hidden md:table-cell">Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Completed By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCompletedPickups.length > 0 ? (
                      filteredCompletedPickups.map((pickup) => (
                        <TableRow key={pickup.id}>
                          <TableCell className="font-medium">{pickup.address}</TableCell>
                          <TableCell>{pickup.date}</TableCell>
                          <TableCell>{pickup.time}</TableCell>
                          <TableCell className="hidden md:table-cell">{pickup.customer}</TableCell>
                          <TableCell className="hidden md:table-cell">{pickup.employee}</TableCell>
                          <TableCell>
                            <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                              {pickup.status}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost">View</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No completed pickups found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}
