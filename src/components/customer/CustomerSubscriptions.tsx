
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CustomerSubscriptionRow } from "@/lib/supabase-types";

interface CustomerSubscriptionsProps {
  userId: string;
}

const CustomerSubscriptions = ({ userId }: CustomerSubscriptionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Get subscriptions for the customer
  const { data: subscriptions, isLoading, error } = useQuery({
    queryKey: ['customerSubscriptions', userId],
    queryFn: async () => {
      // First get the customer-subscription links
      const { data: customerSubs, error: customerSubsError } = await supabase
        .from('customer_subscriptions')
        .select('*')
        .eq('customer_id', userId);
      
      if (customerSubsError) throw customerSubsError;
      
      if (!customerSubs || customerSubs.length === 0) {
        return [];
      }
      
      // Then get the actual subscription details
      const subscriptionIds = customerSubs.map(sub => sub.subscription_id);
      
      const { data: subscriptionData, error: subsError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          service_plans:plan_id (
            name,
            price,
            description,
            frequency
          )
        `)
        .in('id', subscriptionIds);
      
      if (subsError) throw subsError;
      
      return subscriptionData || [];
    },
    enabled: !!userId,
  });

  const handleNavigateToPlans = () => {
    navigate("/subscription");
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });

      // Refresh data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to cancel subscription. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading subscriptions. Please try again later.</p>
      </div>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Subscriptions Found</CardTitle>
          <CardDescription>You don't have any active subscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Subscribe to our service to start enjoying trash valet benefits.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleNavigateToPlans}>Browse Plans</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {subscriptions.map((subscription) => (
        <Card key={subscription.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{subscription.service_plans?.name || "Subscription Plan"}</CardTitle>
                <CardDescription>Started on {new Date(subscription.start_date).toLocaleDateString()}</CardDescription>
              </div>
              <Badge 
                variant={subscription.status === 'active' ? "default" : 
                  subscription.status === 'cancelled' ? "destructive" : "outline"}
              >
                {subscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Plan Price:</span>
                <span className="text-lg">${subscription.service_plans?.price.toFixed(2)}/{subscription.service_plans?.frequency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Next Service Date:</span>
                <span>{subscription.next_service_date ? new Date(subscription.next_service_date).toLocaleDateString() : "Not scheduled"}</span>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-2">Plan Details</h4>
                <p className="text-muted-foreground text-sm">{subscription.service_plans?.description || "No description available."}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate("/schedule")}
              >
                Schedule Pickup
              </Button>
              {subscription.status === "active" && (
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => handleCancelSubscription(subscription.id)}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Cancel Plan"}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ))}
      
      <div className="flex justify-center">
        <Button onClick={handleNavigateToPlans}>Browse Additional Plans</Button>
      </div>
    </div>
  );
};

export default CustomerSubscriptions;
