import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, AlertTriangle, Info, Search, Calendar as CalendarIcon, RefreshCw, Eye } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Loading from "@/components/ui/Loading";
import { useToast } from "@/hooks/use-toast";

interface AuditLog {
  id: string;
  created_at: string;
  user_id: string | null;
  action_type: string;
  resource_type: string | null;
  resource_id: string | null;
  risk_level: string;
  old_values: any;
  new_values: any;
  metadata: any;
  ip_address: unknown;
  user_agent: string | null;
  session_id: string | null;
}

export default function AuditLogs() {
  const { isSuperAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [page, setPage] = useState(1);
  const logsPerPage = 50;

  useEffect(() => {
    if (!authLoading && isSuperAdmin) {
      fetchLogs();
    } else if (!authLoading && !isSuperAdmin) {
      setLoading(false);
    }
  }, [authLoading, isSuperAdmin, page, riskFilter, actionTypeFilter, dateFrom, dateTo]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('enhanced_security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range((page - 1) * logsPerPage, page * logsPerPage - 1);

      // Apply filters
      if (riskFilter !== "all") {
        query = query.eq('risk_level', riskFilter);
      }

      if (actionTypeFilter !== "all") {
        query = query.eq('action_type', actionTypeFilter);
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom.toISOString());
      }

      if (dateTo) {
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endOfDay.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error("Error fetching audit logs:", error);
      toast({
        variant: "destructive",
        title: "Error loading audit logs",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  const handleClearFilters = () => {
    setRiskFilter("all");
    setActionTypeFilter("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setSearchTerm("");
    setPage(1);
  };

  const getRiskLevelBadge = (level: string) => {
    const variants: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
      critical: "destructive",
      high: "destructive",
      medium: "default",
      low: "secondary",
    };
    
    const icons: Record<string, any> = {
      critical: AlertTriangle,
      high: AlertTriangle,
      medium: Info,
      low: Shield,
    };

    const Icon = icons[level] || Info;

    return (
      <Badge variant={variants[level] || "outline"} className="gap-1">
        <Icon className="h-3 w-3" />
        {level.toUpperCase()}
      </Badge>
    );
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.action_type.toLowerCase().includes(searchLower) ||
      log.resource_type?.toLowerCase().includes(searchLower) ||
      log.user_id?.toLowerCase().includes(searchLower)
    );
  });

  if (authLoading) {
    return <Loading fullscreen={true} message="Checking permissions..." />;
  }

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              Only super administrators can access audit logs.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Security Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor all security events, role changes, and sensitive operations
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter audit logs by risk level, action type, and date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="INSERT">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="logout">Logout</SelectItem>
                <SelectItem value="role_change">Role Change</SelectItem>
                <SelectItem value="permission_change">Permission Change</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn(!dateFrom && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "MMM dd, yyyy") : "From Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn(!dateTo && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "MMM dd, yyyy") : "To Date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleClearFilters} variant="ghost" size="sm">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log Entries</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} logs (Page {page})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loading message="Loading audit logs..." />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No audit logs found matching your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Action Type</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {format(new Date(log.created_at), "MMM dd, yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell>{getRiskLevelBadge(log.risk_level)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action_type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.resource_type ? (
                          <span className="font-mono">{log.resource_type}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.user_id ? log.user_id.substring(0, 8) + "..." : "System"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.ip_address ? String(log.ip_address) : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={filteredLogs.length < logsPerPage || loading}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Audit Log Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this security event
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Timestamp</h4>
                  <p className="text-sm font-mono">
                    {format(new Date(selectedLog.created_at), "MMM dd, yyyy HH:mm:ss")}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Risk Level</h4>
                  {getRiskLevelBadge(selectedLog.risk_level)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Action Type</h4>
                  <Badge variant="outline">{selectedLog.action_type}</Badge>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Resource Type</h4>
                  <p className="text-sm font-mono">{selectedLog.resource_type || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Resource ID</h4>
                  <p className="text-sm font-mono break-all">{selectedLog.resource_id || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">User ID</h4>
                  <p className="text-sm font-mono break-all">{selectedLog.user_id || "System"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">IP Address</h4>
                  <p className="text-sm font-mono">{selectedLog.ip_address ? String(selectedLog.ip_address) : "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Session ID</h4>
                  <p className="text-sm font-mono break-all">{selectedLog.session_id || "N/A"}</p>
                </div>
              </div>

              {selectedLog.old_values && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Old Values</h4>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">New Values</h4>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.metadata && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Metadata</h4>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.user_agent && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">User Agent</h4>
                  <p className="text-xs font-mono bg-muted p-3 rounded-md break-all">
                    {selectedLog.user_agent}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
