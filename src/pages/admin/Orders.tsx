import { useState, useMemo } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { useOrders } from "@/hooks/admin/useOrders";
import { useOrderDetails } from "@/hooks/admin/useOrderDetails";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

export default function AdminOrdersPage() {
  const { data: orders, isLoading, error } = useOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { data: details, isLoading: detailsLoading } = useOrderDetails(selectedOrderId);

  const pageTitle = "Orders";

  useMemo(() => {
    document.title = `${pageTitle} | Admin`;
  }, []);

  return (
    <AdminPageLayout title="Orders" description="Track and review customer orders">
      <Card className="p-0">
        <Table>
          <TableCaption>Recent orders</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6}>Loading...</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={6}>Failed to load orders.</TableCell>
              </TableRow>
            )}
            {orders?.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}…</TableCell>
                <TableCell>{o.customer_email || o.user_id}</TableCell>
                <TableCell className="text-right">{o.total} {o.currency?.toUpperCase() || "USD"}</TableCell>
                <TableCell>{o.status}</TableCell>
                <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => setSelectedOrderId(o.id)}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {orders && orders.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={6}>No orders yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {detailsLoading && <div>Loading details…</div>}
          {!detailsLoading && details && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Items</h3>
                <ul className="list-disc pl-6 text-sm">
                  {details.items.map((it) => (
                    <li key={it.id}>
                      {it.description || it.service_id || "Item"} × {it.quantity} — {it.total_amount ?? it.unit_amount * it.quantity}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-2">Payments</h3>
                {details.payments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No payments recorded.</p>
                ) : (
                  <ul className="list-disc pl-6 text-sm">
                    {details.payments.map((p) => (
                      <li key={p.id}>
                        {p.amount} {p.currency?.toUpperCase()} — {p.status} {p.processed_at ? `on ${new Date(p.processed_at).toLocaleString()}` : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
}
