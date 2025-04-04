
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
import { 
  Search,
  Filter,
  Calendar,
  Download
} from "lucide-react";

export default function AdminServiceLogs() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data for service logs
  const serviceLogs = [
    { id: 1, date: "2025-04-01", time: "09:15 AM", address: "123 Main St", customer: "John Smith", employee: "Alex Johnson", status: "Completed", notes: "Regular pickup" },
    { id: 2, date: "2025-04-01", time: "10:30 AM", address: "456 Oak Ave", customer: "Sarah Brown", employee: "Alex Johnson", status: "Completed", notes: "Extra bin fee applied" },
    { id: 3, date: "2025-04-01", time: "01:45 PM", address: "789 Pine Rd", customer: "Springfield Mall", employee: "Dave Miller", status: "Completed", notes: "Recycling collected" },
    { id: 4, date: "2025-04-02", time: "08:30 AM", address: "101 Elm St", customer: "David Johnson", employee: "Chris Taylor", status: "Issue", notes: "Gate locked, no access" },
    { id: 5, date: "2025-04-02", time: "11:15 AM", address: "202 Maple Dr", customer: "Oak Apartments", employee: "Dave Miller", status: "Completed", notes: "All dumpsters emptied" },
  ];
  
  const filteredLogs = serviceLogs.filter(
    (log) =>
      log.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <AdminPageLayout 
      title="Service Logs" 
      description="Review service history and logs"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Date Range
            </Button>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
        
        <Card>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="hidden md:table-cell">Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.date}</TableCell>
                      <TableCell>{log.time}</TableCell>
                      <TableCell className="font-medium">{log.address}</TableCell>
                      <TableCell className="hidden md:table-cell">{log.customer}</TableCell>
                      <TableCell className="hidden md:table-cell">{log.employee}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          log.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {log.status}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{log.notes}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost">View</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No service logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AdminPageLayout>
  );
}
