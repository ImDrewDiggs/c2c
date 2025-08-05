
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

  // Temporarily disabled until subscription tables are created
  const subscriptions = [];
  const isLoading = false;
  const error = null;

  const handleNavigateToPlans = () => {
    navigate("/subscription");
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    // Temporarily disabled until subscription tables are created
    console.log('Would cancel subscription:', subscriptionId);
    toast({
      title: "Feature Coming Soon",
      description: "Subscription management will be available once all tables are set up.",
    });
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
      {/* Temporarily showing mock data until subscription tables are created */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions Coming Soon</CardTitle>
          <CardDescription>The subscription system is being set up.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Database tables are being created for the subscription system.</p>
        </CardContent>
      </Card>
      
      <div className="flex justify-center">
        <Button onClick={handleNavigateToPlans}>Browse Additional Plans</Button>
      </div>
    </div>
  );
};

export default CustomerSubscriptions;
