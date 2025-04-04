
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
  Filter,
  MessageSquare,
  User
} from "lucide-react";

export default function AdminSupportTickets() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data for support tickets
  const tickets = [
    { id: 1, subject: "Missed Pickup", customer: "John Smith", created: "2025-04-02", status: "Open", priority: "High", assignedTo: "Support Team" },
    { id: 2, subject: "Billing Question", customer: "Sarah Brown", created: "2025-04-01", status: "In Progress", priority: "Medium", assignedTo: "David Wilson" },
    { id: 3, subject: "Service Change Request", customer: "Michael Johnson", created: "2025-03-30", status: "Open", priority: "Low", assignedTo: "Unassigned" },
    { id: 4, subject: "App Login Issue", customer: "Lisa Garcia", created: "2025-03-29", status: "In Progress", priority: "Medium", assignedTo: "Alex Lee" },
    { id: 5, subject: "Damaged Bin Replacement", customer: "Robert Miller", created: "2025-03-28", status: "Resolved", priority: "High", assignedTo: "Support Team" },
  ];
  
  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <AdminPageLayout 
      title="Support Tickets" 
      description="View and respond to support requests"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
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
            <Button>
              <MessageSquare className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="pt-4">
            <Card>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="hidden md:table-cell">Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Priority</TableHead>
                      <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.length > 0 ? (
                      filteredTickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell>#{ticket.id}</TableCell>
                          <TableCell className="font-medium">{ticket.subject}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              {ticket.customer}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{ticket.created}</TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              ticket.status === 'Open' 
                                ? 'bg-blue-100 text-blue-800' 
                                : ticket.status === 'In Progress'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }`}>
                              {ticket.status}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              ticket.priority === 'High' 
                                ? 'bg-red-100 text-red-800' 
                                : ticket.priority === 'Medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                            }`}>
                              {ticket.priority}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">{ticket.assignedTo}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost">View</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No tickets found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
          
          {/* Additional tab contents would be similar but filtered by status */}
          <TabsContent value="open" className="pt-4">
            <Card>
              <div className="p-6 text-center text-muted-foreground">
                Open tickets would be displayed here.
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="in-progress" className="pt-4">
            <Card>
              <div className="p-6 text-center text-muted-foreground">
                In-progress tickets would be displayed here.
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="resolved" className="pt-4">
            <Card>
              <div className="p-6 text-center text-muted-foreground">
                Resolved tickets would be displayed here.
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}
