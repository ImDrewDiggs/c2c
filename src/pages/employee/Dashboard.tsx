
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, CheckCircle, Clock, MapPin, Truck, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Map from "@/components/Map/Map";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTask, setActiveTask] = useState<number | null>(null);
  
  // Mock data for employee dashboard
  const tasks = [
    { 
      id: 1, 
      address: "123 Main St", 
      customerName: "John Smith", 
      scheduledTime: "09:00 AM", 
      status: "pending",
      location: { latitude: 37.7749, longitude: -122.4194 } 
    },
    { 
      id: 2, 
      address: "456 Market St", 
      customerName: "Jane Doe", 
      scheduledTime: "10:30 AM", 
      status: "pending",
      location: { latitude: 37.7833, longitude: -122.4167 } 
    },
    { 
      id: 3, 
      address: "789 Mission St", 
      customerName: "Springfield Mall", 
      scheduledTime: "01:45 PM", 
      status: "pending",
      location: { latitude: 37.7850, longitude: -122.4200 } 
    }
  ];
  
  const completedTasks = [
    { 
      id: 101, 
      address: "101 Valencia St", 
      customerName: "Mike Wilson", 
      completedTime: "Yesterday, 03:15 PM", 
      status: "completed" 
    },
    { 
      id: 102, 
      address: "202 Folsom St", 
      customerName: "Sarah Brown", 
      completedTime: "Yesterday, 04:30 PM", 
      status: "completed" 
    }
  ];
  
  const startTask = (taskId: number) => {
    setActiveTask(taskId);
    toast({
      title: "Task Started",
      description: `You've started the pickup at task #${taskId}.`,
    });
  };
  
  const completeTask = (taskId: number) => {
    setActiveTask(null);
    toast({
      title: "Task Completed",
      description: `You've successfully completed task #${taskId}.`,
    });
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Employee Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || 'Employee'}!</p>
        </div>
        
        <div>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            On Duty
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today's Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Pickup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasks[0]?.scheduledTime}</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks" className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Map
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            Schedule
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Pickups</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Card key={task.id} className={`p-4 ${activeTask === task.id ? 'border-2 border-primary' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{task.address}</h4>
                          <p className="text-sm text-muted-foreground">
                            Customer: {task.customerName}
                          </p>
                          <p className="text-sm">
                            Scheduled: {task.scheduledTime}
                          </p>
                        </div>
                        <div>
                          {activeTask === task.id ? (
                            <Button onClick={() => completeTask(task.id)} className="bg-green-500 hover:bg-green-600">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Complete
                            </Button>
                          ) : (
                            <Button onClick={() => startTask(task.id)}>
                              <Truck className="mr-2 h-4 w-4" />
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tasks scheduled for today.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Completed Pickups</CardTitle>
            </CardHeader>
            <CardContent>
              {completedTasks.length > 0 ? (
                <div className="space-y-4">
                  {completedTasks.map((task) => (
                    <Card key={task.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{task.address}</h4>
                          <p className="text-sm text-muted-foreground">
                            Customer: {task.customerName}
                          </p>
                          <p className="text-sm">
                            Completed: {task.completedTime}
                          </p>
                        </div>
                        <Badge className="bg-green-600">Completed</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No completed tasks.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="map">
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-lg">Route Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <Map 
                  houses={tasks.map((task, index) => ({
                    id: `h${task.id}`,
                    address: task.address,
                    location: task.location,
                    customerName: task.customerName,
                    serviceType: 'Residential'
                  }))}
                  assignments={[]}
                  employeeLocations={[]}
                  currentLocation={{ latitude: 37.7749, longitude: -122.4194 }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, index) => (
                  <div key={day} className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <h4 className="font-medium">{day}</h4>
                      <p className="text-sm text-muted-foreground">
                        {index === 0 ? 'Today' : `${index} days ahead`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{3 + Math.floor(Math.random() * 5)} pickups</p>
                      <p className="text-sm text-muted-foreground">
                        Starting at 8:30 AM
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
