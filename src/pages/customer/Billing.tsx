import { useMemo } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/contexts/AuthContext";
import { useMyOrders, useMySubscriber } from "@/hooks/billing/useMyBilling";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function CustomerBillingPage() {
  const { user, userData } = useAuth();
  const { data: orders, isLoading: ordersLoading } = useMyOrders(user?.id);
  const { data: subscriber, isLoading: subLoading } = useMySubscriber(user?.id, user?.email);

  useMemo(() => {
    document.title = "Billing | Can2Curb";
  }, []);

  const isActive = subscriber?.subscribed && (!subscriber.subscription_end || new Date(subscriber.subscription_end) > new Date());

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
                  <Button variant="outline" disabled>Manage in Billing Portal (coming soon)</Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">No subscription found.</p>
                <Button asChild>
                  <a href="/subscription">Browse Plans</a>
                </Button>
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
