
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
  Bell,
  MessageSquare,
  Send,
  Settings,
  Mail
} from "lucide-react";

export default function AdminNotifications() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data for notifications
  const notifications = [
    { id: 1, type: "System", title: "System Maintenance", content: "Scheduled maintenance will occur on April 10th at 2:00 AM.", date: "2025-04-03", status: "Active" },
    { id: 2, type: "Customer", title: "Holiday Schedule", content: "Special pickup schedule for the upcoming holiday.", date: "2025-04-02", status: "Active" },
    { id: 3, type: "Employee", title: "New Safety Protocol", content: "Updated safety guidelines for waste handling.", date: "2025-03-28", status: "Active" },
    { id: 4, type: "System", title: "Software Update", content: "The system will be updated to version 2.5 tonight.", date: "2025-03-25", status: "Expired" },
    { id: 5, type: "Customer", title: "Rate Change", content: "New service rates effective May 1st.", date: "2025-03-20", status: "Scheduled" },
  ];
  
  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <AdminPageLayout 
      title="Notifications" 
      description="Manage system notifications"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Notification
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="employee">Employee</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="pt-4">
            <Card>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden md:table-cell">Content</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications.length > 0 ? (
                      filteredNotifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {notification.type === 'System' ? (
                                <Bell className="h-4 w-4 text-slate-500" />
                              ) : notification.type === 'Customer' ? (
                                <Mail className="h-4 w-4 text-blue-500" />
                              ) : (
                                <MessageSquare className="h-4 w-4 text-green-500" />
                              )}
                              {notification.type}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{notification.title}</TableCell>
                          <TableCell className="hidden md:table-cell">{notification.content}</TableCell>
                          <TableCell>{notification.date}</TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              notification.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : notification.status === 'Scheduled'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}>
                              {notification.status}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="icon" variant="ghost">
                              <Send className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No notifications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
          
          {/* Additional tab contents would be similar but filtered by type */}
          <TabsContent value="system" className="pt-4">
            <Card>
              <div className="p-6 text-center text-muted-foreground">
                System notifications would be displayed here.
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="customer" className="pt-4">
            <Card>
              <div className="p-6 text-center text-muted-foreground">
                Customer notifications would be displayed here.
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="employee" className="pt-4">
            <Card>
              <div className="p-6 text-center text-muted-foreground">
                Employee notifications would be displayed here.
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}
