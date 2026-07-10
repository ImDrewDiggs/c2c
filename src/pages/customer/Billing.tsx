import { useMemo, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";
import { useMyOrders, useMySubscriber } from "@/hooks/billing/useMyBilling";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink } from "lucide-react";

export default function CustomerBillingPage() {
  const { user, userData } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useMyOrders(user?.id);
  const { data: subscriber, isLoading: subLoading } = useMySubscriber(user?.id, user?.email);
  const { toast } = useToast();
  const [portalLoading, setPortalLoading] = useState(false);

  useMemo(() => {
    document.title = "Billing | Can2Curb";
  }, []);

  const isActive = subscriber?.subscribed && (!subscriber.subscription_end || new Date(subscriber.subscription_end) > new Date());

  const openBillingPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (err) {
      console.error("Billing portal error:", err);
      toast({
        variant: "destructive",
        title: "Unable to open billing portal",
        description: "Please try again in a moment or contact support.",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <RequireAuth allowedRoles={["customer"]} redirectTo="/customer/login">
      <div className="container mx-auto py-10 px-4 md:px-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Subscription</CardTitle>
            <CardDescription>Manage your plan and billing status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {subLoading ? (
              <p>Loading subscription…</p>
            ) : subscriber ? (
              <>
                <p>Status: <span className={isActive ? "text-emerald-600" : "text-muted-foreground"}>{isActive ? "Active" : "Inactive"}</span></p>
                <p>Tier: {subscriber.subscription_tier || "-"}</p>
                <p>Next billing: {subscriber.subscription_end ? new Date(subscriber.subscription_end).toLocaleDateString() : "-"}</p>
                <div className="pt-2">
                  <Button onClick={openBillingPortal} disabled={portalLoading}>
                    {portalLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Opening portal…</>
                    ) : (
                      <><ExternalLink className="w-4 h-4 mr-2" /> Manage in Billing Portal</>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">No subscription found.</p>
                <div className="flex gap-2 flex-wrap">
                  <Button asChild>
                    <a href="/subscription">Browse Plans</a>
                  </Button>
                  <Button variant="outline" onClick={openBillingPortal} disabled={portalLoading}>
                    {portalLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Opening…</>
                    ) : (
                      <><ExternalLink className="w-4 h-4 mr-2" /> Open Billing Portal</>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>Recent orders made with your account</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersLoading && (
                  <TableRow>
                    <TableCell colSpan={3}>
                      Loading orders…
                    </TableCell>
                  </TableRow>
                )}
                {orders?.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
                    <TableCell>{o.status}</TableCell>
                    <TableCell className="text-right">{o.total} {o.currency?.toUpperCase() || "USD"}</TableCell>
                  </TableRow>
                ))}
                {orders && orders.length === 0 && !ordersLoading && (
                  <TableRow>
                    <TableCell colSpan={3}>No orders yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
