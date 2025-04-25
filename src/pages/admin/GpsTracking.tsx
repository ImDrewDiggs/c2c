
import React from 'react';
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Calendar } from "lucide-react";
import { EmployeeTracker } from "@/components/admin/EmployeeTracker";
import { ErrorBoundary } from "react-error-boundary";

// Mock data for employee locations
const mockEmployeeLocations = [
  { 
    id: "emp1", 
    employee_id: "emp1", // Added employee_id 
    name: "Alex Johnson", 
    location: { latitude: 37.7749, longitude: -122.4194 }, 
    status: 'active' as const, 
    lastUpdated: "2025-04-25T10:30:00Z" 
  },
  { 
    id: "emp2",
    employee_id: "emp2", // Added employee_id
    name: "Maria Garcia", 
    location: { latitude: 37.7833, longitude: -122.4167 }, 
    status: 'active' as const, 
    lastUpdated: "2025-04-25T10:35:00Z" 
  },
  { 
    id: "emp3",
    employee_id: "emp3", // Added employee_id
    name: "Dave Miller", 
    location: { latitude: 37.7850, longitude: -122.4200 }, 
    status: 'on_break' as const, 
    lastUpdated: "2025-04-25T10:15:00Z" 
  },
  { 
    id: "emp4",
    employee_id: "emp4", // Added employee_id
    name: "Chris Taylor", 
    location: { latitude: 37.7700, longitude: -122.4220 }, 
    status: 'active' as const, 
    lastUpdated: "2025-04-25T10:32:00Z" 
  },
];

function MapErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-md">
      <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong with the map:</h2>
      <pre className="text-sm bg-white p-3 rounded border border-red-100 overflow-auto">
        {error.message}
      </pre>
    </div>
  );
}

export default function AdminGpsTracking() {
  return (
    <AdminPageLayout 
      title="GPS Tracking" 
      description="Real-time employee location tracking"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="pl-8"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              History
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="map">
          <TabsList>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="map" className="pt-4">
            <ErrorBoundary FallbackComponent={MapErrorFallback}>
              <div className="h-[70vh]">
                <EmployeeTracker 
                  employeeLocations={mockEmployeeLocations}
                  currentLocation={{ latitude: 37.7749, longitude: -122.4194 }}
                />
              </div>
            </ErrorBoundary>
          </TabsContent>
          
          <TabsContent value="list" className="pt-4">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Employee Locations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockEmployeeLocations.map((employee) => (
                  <Card key={employee.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Last updated: {new Date(employee.lastUpdated).toLocaleTimeString()}
                        </p>
                        <p className="text-sm">
                          Coordinates: {employee.location.latitude.toFixed(4)}, {employee.location.longitude.toFixed(4)}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs uppercase ${
                        employee.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : employee.status === 'on_break'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.status.replace('_', ' ')}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}
