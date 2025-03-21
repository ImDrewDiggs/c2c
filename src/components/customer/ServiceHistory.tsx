
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ServiceHistoryProps {
  userId: string;
}

interface ServiceLog {
  id: string;
  scheduled_date: string;
  completed_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  subscription: {
    service_plan: {
      name: string;
    } | null;
  } | null;
}

export default function ServiceHistory({ userId }: ServiceHistoryProps) {
  const [serviceLogs, setServiceLogs] = useState<ServiceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    async function fetchServiceHistory() {
      try {
        // First get the customer's subscriptions
        const { data: customerSubs, error: linkError } = await supabase
          .from('customer_subscriptions')
          .select('subscription_id')
          .eq('customer_id', userId);

        if (linkError) throw linkError;
        
        if (!customerSubs || customerSubs.length === 0) {
          setServiceLogs([]);
          setLoading(false);
          return;
        }

        // Get the subscription IDs
        const subscriptionIds = customerSubs.map(cs => cs.subscription_id);
        
        // Then get service logs linked to those subscriptions
        const { data, error } = await supabase
          .from('service_logs')
          .select(`
            id,
            scheduled_date,
            completed_date,
            status,
            notes,
            subscriptions:subscription_id (
              service_plans:plan_id (
                name
              )
            )
          `)
          .in('subscription_id', subscriptionIds)
          .order('scheduled_date', { ascending: false });

        if (error) throw error;

        // Transform the data structure to match our interface
        const transformedLogs = data.map(log => ({
          ...log,
          subscription: log.subscriptions ? {
            service_plan: log.subscriptions.service_plans
          } : null
        }));

        setServiceLogs(transformedLogs);
      } catch (error) {
        console.error('Error fetching service logs:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load service history."
        });
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchServiceHistory();
    }
  }, [userId, toast]);

  const getStatusBadge = (status: ServiceLog['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline">Scheduled</Badge>;
    }
  };

  const filteredLogs = serviceLogs.filter(log => {
    if (activeTab === 'all') return true;
    return log.status === activeTab;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (serviceLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Service History</CardTitle>
          <CardDescription>
            You don't have any service records yet. They will appear here once you have scheduled services.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Scheduled</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredLogs.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Services Found</CardTitle>
            <CardDescription>
              There are no service records with the selected status.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    {log.subscription?.service_plan?.name || "Standard Service"}
                  </CardTitle>
                  {getStatusBadge(log.status)}
                </div>
                <CardDescription>
                  Scheduled: {format(new Date(log.scheduled_date), "MMMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {log.completed_date && (
                    <div>
                      <span className="font-medium">Completed:</span>{" "}
                      {format(new Date(log.completed_date), "MMMM d, yyyy")}
                    </div>
                  )}
                  {log.notes && (
                    <div>
                      <span className="font-medium">Notes:</span>{" "}
                      {log.notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
