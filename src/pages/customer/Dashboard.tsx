import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { RequireAuth } from "@/components/auth/RequireAuth";
import CustomerSubscriptions from "@/components/customer/CustomerSubscriptions";
import CustomerProfile from "@/components/customer/CustomerProfile";
import ServiceHistory from "@/components/customer/ServiceHistory";
import SchedulePickup from "@/components/customer/SchedulePickup";
import BulkItemRequest from "@/components/customer/BulkItemRequest";
import { LogoutButton } from "@/components/LogoutButton";
import { ChangePasswordModal } from "@/components/auth/ChangePasswordModal";
import { Calendar, Package, CreditCard, User, History, Home } from "lucide-react";

export default function CustomerDashboard() {
  const { user, userData } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  return (
    <RequireAuth allowedRoles={['customer']} redirectTo="/customer/login">
      <div className="container mx-auto py-10 px-4 md:px-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Home className="h-8 w-8 text-primary" />
                Customer Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {userData?.full_name || user?.email?.split('@')[0] || 'Customer'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ChangePasswordModal />
              <LogoutButton />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("schedule")}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Schedule</p>
                  <p className="text-2xl font-bold">Pickup</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("bulk")}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bulk Items</p>
                  <p className="text-2xl font-bold">Request</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/customer/billing")}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Billing</p>
                  <p className="text-2xl font-bold">Payment</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("profile")}>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Account</p>
                  <p className="text-2xl font-bold">Profile</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Items</TabsTrigger>
              <TabsTrigger value="subscriptions">Plans</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SchedulePickup userId={user.id} />
                <BulkItemRequest userId={user.id} />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest service interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">
                    No recent activity to display
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule">
              <SchedulePickup userId={user.id} />
            </TabsContent>

            <TabsContent value="bulk">
              <BulkItemRequest userId={user.id} />
            </TabsContent>

            <TabsContent value="subscriptions">
              <CustomerSubscriptions userId={user.id} />
            </TabsContent>

            <TabsContent value="profile">
              <CustomerProfile userId={user.id} userData={userData} />
            </TabsContent>

            <TabsContent value="history">
              <ServiceHistory userId={user.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RequireAuth>
  );
}
