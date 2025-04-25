
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CreditCard, FileText, History, MapPin, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mock data for customer dashboard
  const upcomingPickups = [
    { id: 1, date: "2025-04-25", time: "09:00 AM", status: "scheduled" },
    { id: 2, date: "2025-05-02", time: "09:00 AM", status: "scheduled" },
    { id: 3, date: "2025-05-09", time: "09:00 AM", status: "scheduled" },
  ];
  
  const recentPickups = [
    { id: 101, date: "2025-04-18", time: "09:00 AM", status: "completed" },
    { id: 102, date: "2025-04-11", time: "09:00 AM", status: "completed" },
  ];
  
  const handleSchedulePickup = () => {
    toast({
      title: "Schedule Pickup",
      description: "You've requested an additional pickup. We'll contact you to confirm.",
    });
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Customer Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || 'Customer'}!</p>
        </div>
        
        <Button onClick={handleSchedulePickup}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Pickup
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Pickup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{upcomingPickups[0]?.date}</div>
            <div className="text-lg">{upcomingPickups[0]?.time}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Subscription Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Weekly Premium</div>
            <div className="text-sm text-muted-foreground">$29.99/month</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Next Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">May 1, 2025</div>
            <div className="text-sm text-muted-foreground">Auto-pay enabled</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="property" className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Property
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Pickups</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingPickups.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPickups.map((pickup) => (
                    <Card key={pickup.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Regular Pickup</h4>
                          <p className="text-sm text-muted-foreground">
                            {pickup.date} at {pickup.time}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                            Scheduled
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming pickups scheduled.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subscription Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">Weekly Premium</h3>
                    <p className="text-muted-foreground">Billed monthly</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold">$29.99/month</p>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Plan Includes:</h4>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Weekly pickup
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Bin sanitization
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Odor elimination
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">✓</span> Email notifications
                    </li>
                  </ul>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline">Change Plan</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-muted w-12 h-8 rounded flex items-center justify-center">
                    <span className="text-sm font-medium">VISA</span>
                  </div>
                  <div>
                    <p className="font-medium">Visa ending in 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 09/27</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { date: "April 1, 2025", amount: "$29.99", status: "Paid" },
                  { date: "March 1, 2025", amount: "$29.99", status: "Paid" },
                  { date: "February 1, 2025", amount: "$29.99", status: "Paid" }
                ].map((invoice, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{invoice.date}</p>
                      <p className="text-sm text-muted-foreground">Monthly subscription</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p>{invoice.amount}</p>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        {invoice.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="property" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Service Address</h3>
                  <p className="text-muted-foreground">123 Main Street</p>
                  <p className="text-muted-foreground">Springfield, IL 12345</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Property Type</h3>
                  <p className="text-muted-foreground">Single Family Home</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Number of Bins</h3>
                  <p className="text-muted-foreground">2 bins (Trash, Recycling)</p>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline">Edit Property</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Special Instructions</CardTitle>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p>Please place bins back beside the garage door after service.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service History</CardTitle>
            </CardHeader>
            <CardContent>
              {recentPickups.length > 0 ? (
                <div className="space-y-4">
                  {recentPickups.map((pickup) => (
                    <Card key={pickup.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Regular Pickup</h4>
                          <p className="text-sm text-muted-foreground">
                            {pickup.date} at {pickup.time}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            Completed
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No service history available.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
