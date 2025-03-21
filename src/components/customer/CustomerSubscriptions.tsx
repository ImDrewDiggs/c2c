
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

interface CustomerSubscriptionsProps {
  userId: string;
}

interface Subscription {
  id: string;
  start_date: string;
  next_service_date: string | null;
  status: string;
  created_at: string;
  service_plan: {
    id: string;
    name: string;
    price: number;
    frequency: string;
    description: string | null;
  } | null;
}

export default function CustomerSubscriptions({ userId }: CustomerSubscriptionsProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSubscriptions() {
      try {
        // First get the customer's subscription linkages
        const { data: customerSubs, error: linkError } = await supabase
          .from('customer_subscriptions')
          .select('subscription_id')
          .eq('customer_id', userId);

        if (linkError) throw linkError;
        
        if (!customerSubs || customerSubs.length === 0) {
          setSubscriptions([]);
          setLoading(false);
          return;
        }

        // Get the subscription IDs
        const subscriptionIds = customerSubs.map(cs => cs.subscription_id);
        
        // Get the full subscription details with service plan info
        const { data, error } = await supabase
          .from('subscriptions')
          .select(`
            id, 
            start_date, 
            next_service_date, 
            status, 
            created_at,
            service_plans:plan_id (
              id, 
              name, 
              price, 
              frequency, 
              description
            )
          `)
          .in('id', subscriptionIds);

        if (error) throw error;

        // Transform the data to match our expected format
        const formattedSubscriptions = data.map(sub => ({
          ...sub,
          service_plan: sub.service_plans
        }));

        setSubscriptions(formattedSubscriptions);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load subscription data."
        });
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchSubscriptions();
    }
  }, [userId, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">{status}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{status}</Badge>;
      case 'overdue':
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Subscriptions Found</CardTitle>
          <CardDescription>
            You don't have any active subscriptions yet.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => navigate("/subscription")}>
            Browse Available Plans
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>{subscription.service_plan?.name || "Standard Plan"}</CardTitle>
                {getStatusBadge(subscription.status || "active")}
              </div>
              <CardDescription>
                ${subscription.service_plan?.price || 0} / {subscription.service_plan?.frequency || "month"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Started: {format(new Date(subscription.start_date), "MMM d, yyyy")}
                </span>
              </div>
              {subscription.next_service_date && (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Next service: {format(new Date(subscription.next_service_date), "MMM d, yyyy")}
                  </span>
                </div>
              )}
              {subscription.service_plan?.description && (
                <p className="text-sm text-muted-foreground">{subscription.service_plan.description}</p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
              <Button variant="outline" size="sm">
                View Details
              </Button>
              {subscription.status === 'active' ? (
                <Button variant="destructive" size="sm">
                  Cancel
                </Button>
              ) : (
                <Button variant="default" size="sm">
                  Reactivate
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center">
        <Button onClick={() => navigate("/subscription")}>
          Add New Subscription
        </Button>
      </div>
    </div>
  );
}
