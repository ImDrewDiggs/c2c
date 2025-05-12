
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import CustomerSubscriptions from "@/components/customer/CustomerSubscriptions";
import CustomerProfile from "@/components/customer/CustomerProfile";
import ServiceHistory from "@/components/customer/ServiceHistory";
import { LogoutButton } from "@/components/LogoutButton";
import Loading from "@/components/ui/Loading";

export default function CustomerDashboard() {
  const { user, userData, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [loading, setLoading] = useState(true);
  const [accessVerified, setAccessVerified] = useState(false);

  useEffect(() => {
    const verifyAccess = async () => {
      // Always allow admin access
      if (isSuperAdmin || userData?.role === 'admin') {
        setAccessVerified(true);
        setLoading(false);
        return;
      }
      
      // Check if user is authenticated and has customer role
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please log in to access the customer dashboard.",
        });
        navigate("/customer/login");
        return;
      }
      
      if (userData?.role !== 'customer') {
        toast({
          variant: "destructive",
          title: "Access Denied", 
          description: "You must be a customer to access this dashboard."
        });
        navigate("/");
        return;
      }
      
      setAccessVerified(true);
      setLoading(false);
    };
    
    verifyAccess();
  }, [user, userData, navigate, toast, isSuperAdmin]);

  if (loading || !accessVerified) {
    return (
      <Loading
        fullscreen={true}
        size="medium"
        message="Verifying access..."
      />
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Customer Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {userData?.full_name || user?.email?.split('@')[0] || 'Customer'}
            </p>
          </div>
          <LogoutButton />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your account and services</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button 
              onClick={() => setActiveTab("subscriptions")}
              variant={activeTab === "subscriptions" ? "default" : "outline"}
            >
              View Subscriptions
            </Button>
            <Button 
              onClick={() => setActiveTab("profile")}
              variant={activeTab === "profile" ? "default" : "outline"}
            >
              Manage Profile
            </Button>
            <Button 
              onClick={() => setActiveTab("history")}
              variant={activeTab === "history" ? "default" : "outline"}
            >
              Service History
            </Button>
            <Button 
              onClick={() => navigate("/subscription")}
              variant="outline"
            >
              Browse Plans
            </Button>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="subscriptions">My Subscriptions</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="history">Service History</TabsTrigger>
          </TabsList>

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
  );
}
