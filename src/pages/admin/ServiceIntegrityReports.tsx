import { useState, useMemo } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  RefreshCw,
  Search,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Users,
  ClipboardList,
} from "lucide-react";
import {
  useServiceIntegrityReports,
  useGenerateReport,
  type ServiceIntegrityReport,
  type EmployeePerformance,
  type ReportIssue,
} from "@/hooks/admin/useServiceIntegrityReports";
import { format } from "date-fns";

function getScoreBadge(score: number) {
  if (score >= 90)
    return <Badge className="bg-green-600 text-white">Excellent ({score}%)</Badge>;
  if (score >= 70)
    return <Badge className="bg-yellow-500 text-white">Good ({score}%)</Badge>;
  if (score >= 50)
    return <Badge className="bg-orange-500 text-white">Fair ({score}%)</Badge>;
  return <Badge variant="destructive">Poor ({score}%)</Badge>;
}

function getMonthOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    options.push({ value: val, label: format(d, "MMMM yyyy") });
  }
  return options;
}

function ReportDetailModal({
  report,
  onClose,
}: {
  report: ServiceIntegrityReport;
  onClose: () => void;
}) {
  const employees = report.employees_assigned as EmployeePerformance[];
  const issues = report.issues as ReportIssue[];

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Service Integrity Report — {report.houses?.address || "Unknown"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold">{report.total_scheduled_pickups}</div>
                <div className="text-xs text-muted-foreground">Scheduled</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {report.completed_pickups}
                </div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {report.late_pickups}
                </div>
                <div className="text-xs text-muted-foreground">Late</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-red-500">
                  {report.missed_pickups}
                </div>
                <div className="text-xs text-muted-foreground">Missed</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-medium">Overall Score:</span>
            {getScoreBadge(report.overall_score)}
            <span className="text-sm text-muted-foreground ml-auto">
              Completion Rate: {report.completion_rate}%
            </span>
          </div>

          {/* Employee Performance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" /> Employee Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employees.length === 0 ? (
                <p className="text-sm text-muted-foreground">No employees assigned this month.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-right">Pickups</TableHead>
                      <TableHead className="text-right">Avg Time (min)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp) => (
                      <TableRow key={emp.employee_id}>
                        <TableCell>{emp.name}</TableCell>
                        <TableCell className="text-right">
                          {emp.pickups_completed}
                        </TableCell>
                        <TableCell className="text-right">
                          {emp.avg_time_minutes}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Issues */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Issues & Exceptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {issues.length === 0 ? (
                <p className="text-sm text-muted-foreground">No issues this month. 🎉</p>
              ) : (
                <ul className="space-y-2">
                  {issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <XCircle className="h-4 w-4 mt-0.5 text-destructive flex-shrink-0" />
                      <div>
                        <span className="font-medium">{issue.date}</span> —{" "}
                        {issue.description}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Report generated {format(new Date(report.generated_at), "PPpp")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ServiceIntegrityReports() {
  const monthOptions = useMemo(getMonthOptions, []);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[1]?.value || monthOptions[0]?.value);
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<ServiceIntegrityReport | null>(null);

  const { data: reports, isLoading } = useServiceIntegrityReports(selectedMonth);
  const generateMutation = useGenerateReport();

  const filtered = useMemo(() => {
    if (!reports) return [];
    if (!search) return reports;
    const q = search.toLowerCase();
    return reports.filter((r) =>
      (r.houses?.address || "").toLowerCase().includes(q)
    );
  }, [reports, search]);

  // Stats
  const avgScore = filtered.length
    ? Math.round(filtered.reduce((s, r) => s + r.overall_score, 0) / filtered.length)
    : 0;
  const totalScheduled = filtered.reduce((s, r) => s + r.total_scheduled_pickups, 0);
  const totalMissed = filtered.reduce((s, r) => s + r.missed_pickups, 0);

  function exportCsv() {
    if (!filtered.length) return;
    const header = "Address,Month,Scheduled,Completed,Late,Missed,Completion Rate,Score\n";
    const rows = filtered
      .map(
        (r) =>
          `"${r.houses?.address || ""}",${r.report_month},${r.total_scheduled_pickups},${r.completed_pickups},${r.late_pickups},${r.missed_pickups},${r.completion_rate}%,${r.overall_score}`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `service-integrity-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AdminPageLayout
      title="Service Integrity Reports"
      description="Monthly auto-generated service quality reports per location"
    >
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 ml-auto">
          <Button
            variant="outline"
            onClick={() => generateMutation.mutate({ month: selectedMonth })}
            disabled={generateMutation.isPending}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${generateMutation.isPending ? "animate-spin" : ""}`} />
            {generateMutation.isPending ? "Generating..." : "Generate Reports"}
          </Button>
          <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{filtered.length}</div>
              <div className="text-xs text-muted-foreground">Locations</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold">{avgScore}%</div>
              <div className="text-xs text-muted-foreground">Avg Score</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">{totalScheduled}</div>
              <div className="text-xs text-muted-foreground">Total Scheduled</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-destructive" />
            <div>
              <div className="text-2xl font-bold">{totalMissed}</div>
              <div className="text-xs text-muted-foreground">Total Missed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead className="text-center">Scheduled</TableHead>
                <TableHead className="text-center">Completed</TableHead>
                <TableHead className="text-center">Late</TableHead>
                <TableHead className="text-center">Missed</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading reports...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No reports found. Click "Generate Reports" to create them.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedReport(r)}>
                    <TableCell className="font-medium">
                      {r.houses?.address || r.house_id}
                    </TableCell>
                    <TableCell className="text-center">{r.total_scheduled_pickups}</TableCell>
                    <TableCell className="text-center">{r.completed_pickups}</TableCell>
                    <TableCell className="text-center">{r.late_pickups}</TableCell>
                    <TableCell className="text-center">{r.missed_pickups}</TableCell>
                    <TableCell className="text-center">{getScoreBadge(r.overall_score)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedReport(r); }}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedReport && (
        <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />
      )}
    </AdminPageLayout>
  );
}
