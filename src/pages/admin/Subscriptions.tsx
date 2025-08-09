import { useMemo } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { useSubscribers } from "@/hooks/admin/useSubscribers";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";

export default function AdminSubscriptionsPage() {
  const { data: subs, isLoading, error } = useSubscribers();
  const pageTitle = "Subscriptions";

  useMemo(() => {
    document.title = `${pageTitle} | Admin`;
  }, []);

  return (
    <AdminPageLayout title="Subscriptions" description="Manage subscriber records">
      <Card className="p-0">
        <Table>
          <TableCaption>All subscribers</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5}>Loading…</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={5}>Failed to load subscribers.</TableCell>
              </TableRow>
            )}
            {subs?.map((s) => {
              const isActive = s.subscribed && (!s.subscription_end || new Date(s.subscription_end) > new Date());
              return (
                <TableRow key={s.id}>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{isActive ? "active" : "inactive"}</TableCell>
                  <TableCell>{s.subscription_tier || "-"}</TableCell>
                  <TableCell>{s.subscription_end ? new Date(s.subscription_end).toLocaleDateString() : "-"}</TableCell>
                  <TableCell>{new Date(s.created_at).toLocaleString()}</TableCell>
                </TableRow>
              );
            })}
            {subs && subs.length === 0 && !isLoading && (
              <TableRow>
                <TableCell colSpan={5}>No subscribers yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </AdminPageLayout>
  );
}
