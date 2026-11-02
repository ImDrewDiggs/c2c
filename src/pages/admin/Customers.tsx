import { useEffect, useState } from "react";
import { format } from "date-fns";
import { UserPlus, Search, Loader2 } from "lucide-react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCustomers } from "@/hooks/admin/useCustomers";
import { AddCustomerModal } from "@/components/admin/modals/AddCustomerModal";
import { EditCustomerModal } from "@/components/admin/modals/EditCustomerModal";

/** Debounce search so we don't query on every keystroke. */
function useDebounced(value: string, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const debouncedSearch = useDebounced(searchTerm);
  const { data: customers = [], isLoading, error } = useCustomers(debouncedSearch);

  return (
    <AdminPageLayout title="Manage Customers" description="View and manage customer accounts">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search customers..."
              aria-label="Search customers"
              className="pl-8"
              value={searchTerm}
              maxLength={100}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Address</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="hidden md:table-cell">Since</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="h-5 w-5 animate-spin inline-block text-primary" aria-label="Loading customers" />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-destructive">
                    Couldn't load customers. Please try again.
                  </TableCell>
                </TableRow>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.full_name || "—"}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{c.address || "—"}</TableCell>
                    <TableCell>{c.subscription_tier || "None"}</TableCell>
                    <TableCell className="hidden md:table-cell">{format(new Date(c.created_at), "MMM yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant={c.subscription_status === "active" ? "default" : "secondary"} className="capitalize">
                        {c.subscription_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => setEditId(c.id)}>Edit</Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">No customers found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddCustomerModal open={addOpen} onOpenChange={setAddOpen} />
      {editId && (
        <EditCustomerModal
          open={!!editId}
          onOpenChange={(open) => !open && setEditId(null)}
          customerId={editId}
        />
      )}
    </AdminPageLayout>
  );
}
