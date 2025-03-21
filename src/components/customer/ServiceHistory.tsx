
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { CustomerSubscriptionRow } from "@/lib/supabase-types";

interface ServiceHistoryProps {
  userId: string;
}

const ServiceHistory = ({ userId }: ServiceHistoryProps) => {
  // Get service history for the customer
  const { data: serviceHistory, isLoading, error } = useQuery({
    queryKey: ['serviceHistory', userId],
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
      
      // Then get the service logs for those subscriptions
      const subscriptionIds = customerSubs.map(sub => sub.subscription_id);
      
      const { data: serviceLogs, error: logsError } = await supabase
        .from('service_logs')
        .select(`
          *,
          employee:employee_id (
            full_name
          ),
          subscription:subscription_id (
            service_plans:plan_id (
              name
            )
          )
        `)
        .in('subscription_id', subscriptionIds)
        .order('scheduled_date', { ascending: false });
      
      if (logsError) throw logsError;
      
      return serviceLogs || [];
    },
    enabled: !!userId,
  });

  // Get appointments for this user
  const { data: appointments } = useQuery({
    queryKey: ['userAppointments', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!userId,
  });

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
        <p className="text-destructive">Error loading service history. Please try again later.</p>
      </div>
    );
  }

  const combinedHistory = [
    ...(serviceHistory || []).map(log => ({
      id: log.id,
      date: log.scheduled_date,
      title: `${log.subscription?.service_plans?.name || 'Service'} Visit`,
      status: log.status,
      type: 'service',
      employee: log.employee?.full_name || 'Not assigned',
      notes: log.notes,
      completed_date: log.completed_date
    })),
    ...(appointments || []).map(apt => ({
      id: apt.id,
      date: apt.start_time,
      title: apt.title,
      status: apt.status,
      type: 'appointment',
      employee: 'N/A',
      notes: apt.description,
      completed_date: null
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (combinedHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Service History</CardTitle>
          <CardDescription>You don't have any service history or scheduled appointments yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Service history will appear here once you've had services performed or scheduled pickups.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Your Service History</h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        {combinedHistory.map((item) => (
          <Card key={`${item.type}-${item.id}`} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(parseISO(item.date), 'MMMM d, yyyy')}
                  </CardDescription>
                </div>
                <Badge 
                  variant={
                    item.status === 'completed' ? "default" : 
                    item.status === 'cancelled' ? "destructive" : 
                    "secondary"
                  }
                >
                  {item.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {item.type === 'service' && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Provider:</span>
                    <span>{item.employee}</span>
                  </div>
                )}
                
                {item.completed_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed:</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {format(parseISO(item.completed_date), 'MMMM d, h:mm a')}
                    </span>
                  </div>
                )}
                
                {item.notes && (
                  <div className="pt-2">
                    <span className="text-muted-foreground block">Notes:</span>
                    <p className="italic mt-1">{item.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceHistory;
