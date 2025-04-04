
import { useState } from "react";
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
  Search,
  Calendar
} from "lucide-react";

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data - would be replaced with actual data from Supabase
  const customers = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", address: "123 Main St", plan: "Standard", since: "Jan 2023", status: "Active" },
    { id: 2, name: "Bob Smith", email: "bob@example.com", address: "456 Oak Ave", plan: "Premium", since: "Mar 2023", status: "Active" },
    { id: 3, name: "Carol Williams", email: "carol@example.com", address: "789 Pine Rd", plan: "Basic", since: "Jun 2023", status: "Paused" },
    { id: 4, name: "David Brown", email: "david@example.com", address: "101 Elm St", plan: "Premium", since: "Sep 2023", status: "Active" },
    { id: 5, name: "Eve Davis", email: "eve@example.com", address: "202 Maple Dr", plan: "Standard", since: "Dec 2023", status: "Inactive" },
  ];
  
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <AdminPageLayout 
      title="Manage Customers" 
      description="View and manage customer accounts"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="hidden md:table-cell">Since</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{customer.address}</TableCell>
                    <TableCell>{customer.plan}</TableCell>
                    <TableCell className="hidden md:table-cell">{customer.since}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        customer.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : customer.status === 'Paused' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.status}
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
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminPageLayout>
  );
}
