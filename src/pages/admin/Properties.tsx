
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
  Building,
  Search,
  Plus,
  MapPin
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminProperties() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data for properties
  const properties = [
    { id: 1, address: "123 Main St", city: "Springfield", state: "IL", type: "Residential", customer: "John Smith", status: "Active" },
    { id: 2, address: "456 Oak Ave", city: "Springfield", state: "IL", type: "Residential", customer: "Sarah Brown", status: "Active" },
    { id: 3, address: "789 Pine Rd", city: "Springfield", state: "IL", type: "Commercial", customer: "Springfield Mall", status: "Active" },
    { id: 4, address: "101 Elm St", city: "Springfield", state: "IL", type: "Residential", customer: "David Johnson", status: "Inactive" },
    { id: 5, address: "202 Maple Dr", city: "Springfield", state: "IL", type: "Multi-Family", customer: "Oak Apartments", status: "Active" },
  ];
  
  const filteredProperties = properties.filter(
    (property) =>
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.type.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <AdminPageLayout 
      title="Properties" 
      description="Manage service locations"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <MapPin className="mr-2 h-4 w-4" />
              View Map
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Properties</TabsTrigger>
            <TabsTrigger value="residential">Residential</TabsTrigger>
            <TabsTrigger value="multi-family">Multi-Family</TabsTrigger>
            <TabsTrigger value="commercial">Commercial</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="pt-4">
            <Card>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead className="hidden md:table-cell">City</TableHead>
                      <TableHead className="hidden md:table-cell">State</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="hidden md:table-cell">Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.length > 0 ? (
                      filteredProperties.map((property) => (
                        <TableRow key={property.id}>
                          <TableCell className="font-medium">{property.address}</TableCell>
                          <TableCell className="hidden md:table-cell">{property.city}</TableCell>
                          <TableCell className="hidden md:table-cell">{property.state}</TableCell>
                          <TableCell>{property.type}</TableCell>
                          <TableCell className="hidden md:table-cell">{property.customer}</TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              property.status === 'Active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {property.status}
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
                          No properties found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="residential" className="pt-4">
            <Card>
              <div className="p-6 text-center text-muted-foreground">
                Filter content based on the Residential property type selection.
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="multi-family" className="pt-4">
            <Card>
              <div className="p-6 text-center text-muted-foreground">
                Filter content based on the Multi-Family property type selection.
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="commercial" className="pt-4">
            <Card>
              <div className="p-6 text-center text-muted-foreground">
                Filter content based on the Commercial property type selection.
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}
