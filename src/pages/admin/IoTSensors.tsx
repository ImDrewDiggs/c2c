import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Loading from "@/components/ui/Loading";
import { useIoTSensors, type CreateSensorPayload, type IoTSensor } from "@/hooks/admin/useIoTSensors";
import {
  Wifi, WifiOff, Plus, Trash2, Copy, Eye, EyeOff,
  AlertTriangle, CheckCircle, ThermometerSun, MapPin,
  Activity, Gauge, Radio, Bell, RefreshCw, Settings2, Search,
  Edit2, Save, X, Clock
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { format, formatDistanceToNow } from "date-fns";

const SENSOR_TYPES = [
  { value: "temperature_humidity", label: "Temperature/Humidity", icon: ThermometerSun },
  { value: "gps_tracker", label: "GPS Tracker", icon: MapPin },
  { value: "fill_level", label: "Fill-level Sensor", icon: Gauge },
  { value: "motion_proximity", label: "Motion/Proximity", icon: Activity },
  { value: "generic", label: "Generic Sensor", icon: Radio },
];

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function getSensorIcon(type: string) {
  const found = SENSOR_TYPES.find((s) => s.value === type);
  return found?.icon || Radio;
}

export default function IoTSensorsPage() {
  const {
    sensors,
    readings,
    alerts,
    loading,
    fetchSensors,
    fetchReadings,
    fetchAlerts,
    createSensor,
    updateSensor,
    deleteSensor,
    acknowledgeAlert,
  } = useIoTSensors();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("sensors");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<IoTSensor | null>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Add sensor form
  const [newSensor, setNewSensor] = useState<CreateSensorPayload>({
    name: "",
    sensor_type: "generic",
    device_id: "",
    description: "",
    location_label: "",
  });
  const [thresholdKey, setThresholdKey] = useState("");
  const [thresholdMin, setThresholdMin] = useState("");
  const [thresholdMax, setThresholdMax] = useState("");
  const [newThresholds, setNewThresholds] = useState<Record<string, { min?: number; max?: number }>>({});

  // Threshold editing for detail view
  const [editingThresholds, setEditingThresholds] = useState(false);
  const [editThresholds, setEditThresholds] = useState<Record<string, { min?: number; max?: number }>>({});
  const [editThresholdKey, setEditThresholdKey] = useState("");
  const [editThresholdMin, setEditThresholdMin] = useState("");
  const [editThresholdMax, setEditThresholdMax] = useState("");

  // Auto-refresh polling
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPolling = useCallback(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      await Promise.all([fetchSensors(), fetchAlerts(true)]);
    }, 30000); // every 30s
  }, [fetchSensors, fetchAlerts]);

  useEffect(() => {
    startPolling();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [startPolling]);

  // Keep selectedSensor in sync when sensors list updates
  useEffect(() => {
    if (selectedSensor) {
      const updated = sensors.find((s) => s.id === selectedSensor.id);
      if (updated) setSelectedSensor(updated);
    }
  }, [sensors]);

  const filteredSensors = useMemo(() => {
    return sensors.filter((s) => {
      const matchesSearch =
        searchQuery === "" ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.device_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.location_label || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || s.sensor_type === filterType;
      const matchesStatus = filterStatus === "all" || s.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [sensors, searchQuery, filterType, filterStatus]);

  const unacknowledgedAlerts = useMemo(
    () => alerts.filter((a) => !a.acknowledged_at),
    [alerts]
  );

  // Build pivot chart data: one row per timestamp, columns per reading type
  const { chartData, chartReadingTypes } = useMemo(() => {
    if (!selectedSensor) return { chartData: [], chartReadingTypes: [] };

    const sensorReadings = readings
      .filter((r) => r.sensor_id === selectedSensor.id)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

    const types = Array.from(new Set(sensorReadings.map((r) => r.reading_type)));

    // Group by recorded_at (same timestamp bucket)
    const buckets: Record<string, Record<string, number | string>> = {};
    for (const r of sensorReadings) {
      const key = format(new Date(r.recorded_at), "MM/dd HH:mm");
      if (!buckets[key]) buckets[key] = { time: key };
      buckets[key][r.reading_type] = r.value;
    }

    const data = Object.values(buckets);
    return { chartData: data, chartReadingTypes: types };
  }, [selectedSensor, readings]);

  const handleAddSensor = async () => {
    if (!newSensor.name.trim() || !newSensor.device_id.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name and Device ID are required",
      });
      return;
    }
    const result = await createSensor({ ...newSensor, alert_thresholds: newThresholds });
    if (result) {
      setShowAddDialog(false);
      setNewSensor({ name: "", sensor_type: "generic", device_id: "", description: "", location_label: "" });
      setNewThresholds({});
      setThresholdKey("");
      setThresholdMin("");
      setThresholdMax("");
    }
  };

  const handleAddThreshold = () => {
    if (!thresholdKey.trim()) return;
    setNewThresholds((prev) => ({
      ...prev,
      [thresholdKey.trim()]: {
        ...(thresholdMin !== "" ? { min: parseFloat(thresholdMin) } : {}),
        ...(thresholdMax !== "" ? { max: parseFloat(thresholdMax) } : {}),
      },
    }));
    setThresholdKey("");
    setThresholdMin("");
    setThresholdMax("");
  };

  const handleViewSensor = async (sensor: IoTSensor) => {
    setSelectedSensor(sensor);
    await fetchReadings(sensor.id, 200);
    setActiveTab("detail");
    setEditingThresholds(false);
  };

  const handleRefresh = async () => {
    await Promise.all([fetchSensors(), fetchAlerts(true)]);
    if (selectedSensor) await fetchReadings(selectedSensor.id, 200);
    toast({ title: "Refreshed", description: "Data updated" });
  };

  const handleToggleStatus = async (sensor: IoTSensor) => {
    const newStatus = sensor.status === "active" ? "inactive" : "active";
    await updateSensor(sensor.id, { status: newStatus });
  };

  const handleStartEditThresholds = () => {
    setEditThresholds({ ...(selectedSensor?.alert_thresholds || {}) });
    setEditingThresholds(true);
    setEditThresholdKey("");
    setEditThresholdMin("");
    setEditThresholdMax("");
  };

  const handleAddEditThreshold = () => {
    if (!editThresholdKey.trim()) return;
    setEditThresholds((prev) => ({
      ...prev,
      [editThresholdKey.trim()]: {
        ...(editThresholdMin !== "" ? { min: parseFloat(editThresholdMin) } : {}),
        ...(editThresholdMax !== "" ? { max: parseFloat(editThresholdMax) } : {}),
      },
    }));
    setEditThresholdKey("");
    setEditThresholdMin("");
    setEditThresholdMax("");
  };

  const handleSaveThresholds = async () => {
    if (!selectedSensor) return;
    await updateSensor(selectedSensor.id, { alert_thresholds: editThresholds });
    setEditingThresholds(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    toast({ title: "Copied", description: "Copied to clipboard" });
  };

  const webhookUrl = `https://iagkylxqlartqokuiahf.supabase.co/functions/v1/iot-sensor-webhook`;

  if (loading) return <Loading fullscreen message="Loading IoT sensors..." />;

  return (
    <AdminPageLayout
      title="IoT Sensor Management"
      description="Add, monitor, and manage IoT sensors in real-time"
    >
      {/* Stats overview */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sensors</p>
                <p className="text-2xl font-bold">{sensors.length}</p>
              </div>
              <Radio className="h-8 w-8 text-primary opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-primary">
                  {sensors.filter((s) => s.status === "active").length}
                </p>
              </div>
              <Wifi className="h-8 w-8 text-primary opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {sensors.filter((s) => s.status !== "active").length}
                </p>
              </div>
              <WifiOff className="h-8 w-8 text-muted-foreground opacity-70" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold text-destructive">
                  {unacknowledgedAlerts.length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-destructive opacity-70" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="sensors">Sensors</TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts
              {unacknowledgedAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-1.5 px-1.5 py-0 text-[10px]">
                  {unacknowledgedAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="webhook">Webhook Setup</TabsTrigger>
            {selectedSensor && (
              <TabsTrigger value="detail">
                <Settings2 className="h-3 w-3 mr-1" />
                {selectedSensor.name}
              </TabsTrigger>
            )}
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Sensor
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Sensor</DialogTitle>
                  <DialogDescription>
                    Register a new IoT sensor to start monitoring.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sensor Name *</Label>
                      <Input
                        value={newSensor.name}
                        onChange={(e) => setNewSensor((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Bin Sensor #1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Device ID *</Label>
                      <Input
                        value={newSensor.device_id}
                        onChange={(e) =>
                          setNewSensor((p) => ({ ...p, device_id: e.target.value }))
                        }
                        placeholder="sensor-001"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Sensor Type</Label>
                    <Select
                      value={newSensor.sensor_type}
                      onValueChange={(v) => setNewSensor((p) => ({ ...p, sensor_type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SENSOR_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newSensor.description}
                      onChange={(e) =>
                        setNewSensor((p) => ({ ...p, description: e.target.value }))
                      }
                      placeholder="Optional description..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Location Label</Label>
                    <Input
                      value={newSensor.location_label}
                      onChange={(e) =>
                        setNewSensor((p) => ({ ...p, location_label: e.target.value }))
                      }
                      placeholder="e.g. Main St & 5th Ave"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Latitude</Label>
                      <Input
                        type="number"
                        step="any"
                        onChange={(e) =>
                          setNewSensor((p) => ({
                            ...p,
                            location_lat: e.target.value ? parseFloat(e.target.value) : undefined,
                          }))
                        }
                        placeholder="34.0522"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Longitude</Label>
                      <Input
                        type="number"
                        step="any"
                        onChange={(e) =>
                          setNewSensor((p) => ({
                            ...p,
                            location_lng: e.target.value ? parseFloat(e.target.value) : undefined,
                          }))
                        }
                        placeholder="-118.2437"
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Alert Thresholds</Label>
                    <p className="text-xs text-muted-foreground">
                      Set min/max values for reading types to trigger alerts.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Reading type (e.g. temperature)"
                        value={thresholdKey}
                        onChange={(e) => setThresholdKey(e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Min"
                        type="number"
                        value={thresholdMin}
                        onChange={(e) => setThresholdMin(e.target.value)}
                        className="w-20"
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        value={thresholdMax}
                        onChange={(e) => setThresholdMax(e.target.value)}
                        className="w-20"
                      />
                      <Button variant="outline" size="sm" onClick={handleAddThreshold}>
                        Add
                      </Button>
                    </div>
                    {Object.entries(newThresholds).length > 0 && (
                      <div className="space-y-1 mt-2">
                        {Object.entries(newThresholds).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline">{key}</Badge>
                            {val.min != null && <span>Min: {val.min}</span>}
                            {val.max != null && <span>Max: {val.max}</span>}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                setNewThresholds((prev) => {
                                  const n = { ...prev };
                                  delete n[key];
                                  return n;
                                })
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSensor}>Add Sensor</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* ── Sensors Tab ── */}
        <TabsContent value="sensors" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, device ID, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {SENSOR_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sensor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Device ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Reading</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSensors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        <Radio className="h-10 w-10 mx-auto mb-3 opacity-30" />
                        <p>No sensors found. Add one to get started.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSensors.map((sensor) => {
                      const Icon = getSensorIcon(sensor.sensor_type);
                      return (
                        <TableRow
                          key={sensor.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleViewSensor(sensor)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-primary shrink-0" />
                              <div>
                                <p className="font-medium">{sensor.name}</p>
                                {sensor.description && (
                                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                                    {sensor.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {SENSOR_TYPES.find((t) => t.value === sensor.sensor_type)?.label ||
                                sensor.sensor_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{sensor.device_id}</TableCell>
                          <TableCell className="text-sm">
                            {sensor.location_label ||
                              (sensor.location_lat
                                ? `${sensor.location_lat}, ${sensor.location_lng}`
                                : "—")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={sensor.status === "active" ? "default" : "secondary"}
                              className="gap-1"
                            >
                              {sensor.status === "active" ? (
                                <Wifi className="h-3 w-3" />
                              ) : (
                                <WifiOff className="h-3 w-3" />
                              )}
                              {sensor.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {sensor.last_reading_at ? (
                              <span className="text-xs flex items-center gap-1">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                {formatDistanceToNow(new Date(sensor.last_reading_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">Never</span>
                            )}
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-1">
                              <code className="text-[10px] bg-muted px-1 rounded max-w-[70px] truncate">
                                {showApiKey[sensor.id] ? sensor.api_key : "••••••••"}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() =>
                                  setShowApiKey((p) => ({ ...p, [sensor.id]: !p[sensor.id] }))
                                }
                              >
                                {showApiKey[sensor.id] ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(sensor.api_key)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell
                            className="text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewSensor(sensor)}
                                title="View details"
                              >
                                <Settings2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(sensor)}
                                title={sensor.status === "active" ? "Deactivate" : "Activate"}
                              >
                                {sensor.status === "active" ? (
                                  <WifiOff className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <Wifi className="h-4 w-4 text-primary" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (confirm(`Delete sensor "${sensor.name}"? This will also delete all its readings and alerts.`)) {
                                    deleteSensor(sensor.id);
                                    if (selectedSensor?.id === sensor.id) {
                                      setSelectedSensor(null);
                                      setActiveTab("sensors");
                                    }
                                  }
                                }}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Alerts Tab ── */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Alerts</CardTitle>
              <CardDescription>Threshold violations and sensor warnings</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-3 text-primary opacity-50" />
                  <p className="font-medium">All clear</p>
                  <p className="text-sm">All sensors are operating within thresholds.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                        !alert.acknowledged_at
                          ? "border-destructive/40 bg-destructive/5"
                          : "border-border bg-muted/30"
                      }`}
                    >
                      <AlertTriangle
                        className={`h-5 w-5 mt-0.5 shrink-0 ${
                          alert.severity === "critical"
                            ? "text-destructive"
                            : "text-yellow-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(alert.created_at), "MMM d, yyyy h:mm a")}
                          {alert.reading_value != null && ` • Value: ${alert.reading_value}`}
                          {alert.threshold_value != null &&
                            ` • Threshold: ${alert.threshold_value}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={alert.severity === "critical" ? "destructive" : "secondary"}
                            className="text-[10px]"
                          >
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {alert.alert_type}
                          </Badge>
                        </div>
                      </div>
                      {!alert.acknowledged_at ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="shrink-0"
                        >
                          Acknowledge
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="shrink-0">
                          Acknowledged
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Webhook Setup Tab ── */}
        <TabsContent value="webhook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Configuration</CardTitle>
              <CardDescription>
                Configure your IoT devices to POST data to this endpoint.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <div className="flex gap-2">
                  <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                  <Button variant="outline" onClick={() => copyToClipboard(webhookUrl)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use the sensor's <strong>API Key</strong> from the sensors table in the{" "}
                  <code className="bg-muted px-1 rounded">X-Sensor-Api-Key</code> header.
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2 text-sm">Request Format</h4>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto leading-relaxed">{`POST ${webhookUrl}
Headers:
  Content-Type: application/json
  X-Sensor-Api-Key: <your_sensor_api_key>

Body:
{
  "device_id": "sensor-001",
  "readings": [
    { "type": "temperature", "value": 72.5, "unit": "°F" },
    { "type": "humidity",    "value": 45.2, "unit": "%" },
    { "type": "fill_level",  "value": 85,   "unit": "%" }
  ],
  "timestamp": "2026-02-20T12:00:00Z",
  "location": { "lat": 34.0522, "lng": -118.2437 },
  "raw_data": { "battery": 95, "signal_strength": -42 }
}`}</pre>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2 text-sm">Response</h4>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">{`// Success (200)
{ "success": true, "readings_stored": 3 }

// Error (400/401/404/500)
{ "error": "Sensor not found" }`}</pre>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2 text-sm">Supported Reading Types</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "temperature",
                    "humidity",
                    "fill_level",
                    "motion",
                    "proximity",
                    "battery",
                    "signal_strength",
                    "latitude",
                    "longitude",
                    "speed",
                    "pressure",
                    "weight",
                    "vibration",
                    "door_open",
                  ].map((type) => (
                    <Badge key={type} variant="outline" className="font-mono text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Any custom reading type string is accepted (max 64 chars).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Sensor Detail Tab ── */}
        {selectedSensor && (
          <TabsContent value="detail" className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {(() => {
                    const Icon = getSensorIcon(selectedSensor.sensor_type);
                    return <Icon className="h-5 w-5 text-primary" />;
                  })()}
                  {selectedSensor.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Device: <code className="bg-muted px-1 rounded">{selectedSensor.device_id}</code>
                  {selectedSensor.location_label && ` • ${selectedSensor.location_label}`}
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchReadings(selectedSensor.id, 200)}
                >
                  <RefreshCw className="h-4 w-4 mr-1" /> Refresh Readings
                </Button>
                <Button
                  variant={selectedSensor.status === "active" ? "secondary" : "default"}
                  size="sm"
                  onClick={() => handleToggleStatus(selectedSensor)}
                >
                  {selectedSensor.status === "active" ? (
                    <>
                      <WifiOff className="h-4 w-4 mr-1" /> Deactivate
                    </>
                  ) : (
                    <>
                      <Wifi className="h-4 w-4 mr-1" /> Activate
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm(`Delete sensor "${selectedSensor.name}"?`)) {
                      deleteSensor(selectedSensor.id);
                      setSelectedSensor(null);
                      setActiveTab("sensors");
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </div>
            </div>

            {/* Sensor info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge
                    variant={selectedSensor.status === "active" ? "default" : "secondary"}
                    className="mt-1 gap-1"
                  >
                    {selectedSensor.status === "active" ? (
                      <Wifi className="h-3 w-3" />
                    ) : (
                      <WifiOff className="h-3 w-3" />
                    )}
                    {selectedSensor.status}
                  </Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium mt-1">
                    {SENSOR_TYPES.find((t) => t.value === selectedSensor.sensor_type)?.label ||
                      selectedSensor.sensor_type}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">Last Reading</p>
                  <p className="text-sm font-medium mt-1">
                    {selectedSensor.last_reading_at
                      ? formatDistanceToNow(new Date(selectedSensor.last_reading_at), {
                          addSuffix: true,
                        })
                      : "Never"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground">API Key</p>
                  <div className="flex items-center gap-1 mt-1">
                    <code className="text-xs bg-muted px-1 rounded truncate max-w-[80px]">
                      {showApiKey[selectedSensor.id]
                        ? selectedSensor.api_key.slice(0, 16) + "…"
                        : "••••••••••••••••"}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() =>
                        setShowApiKey((p) => ({
                          ...p,
                          [selectedSensor.id]: !p[selectedSensor.id],
                        }))
                      }
                    >
                      {showApiKey[selectedSensor.id] ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0"
                      onClick={() => copyToClipboard(selectedSensor.api_key)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Historical chart */}
            <Card>
              <CardHeader>
                <CardTitle>Readings History</CardTitle>
                <CardDescription>
                  Last 200 readings — {readings.filter((r) => r.sensor_id === selectedSensor.id).length} total
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p>No readings recorded yet.</p>
                    <p className="text-sm mt-1">
                      Send data via the webhook to see it here.
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                        interval="preserveStartEnd"
                      />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          color: "hsl(var(--card-foreground))",
                          fontSize: "12px",
                        }}
                      />
                      <Legend />
                      {chartReadingTypes.map((type, i) => (
                        <Line
                          key={type}
                          type="monotone"
                          dataKey={type}
                          name={type}
                          stroke={CHART_COLORS[i % CHART_COLORS.length]}
                          dot={false}
                          strokeWidth={2}
                          connectNulls={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Latest readings table */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Readings</CardTitle>
                <CardDescription>Most recent 20 readings from this sensor</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Recorded At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readings
                      .filter((r) => r.sensor_id === selectedSensor.id)
                      .slice(0, 20)
                      .map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            <Badge variant="outline">{r.reading_type}</Badge>
                          </TableCell>
                          <TableCell className="font-mono">{r.value}</TableCell>
                          <TableCell className="text-muted-foreground">{r.unit || "—"}</TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(r.recorded_at), "MMM d, h:mm:ss a")}
                          </TableCell>
                        </TableRow>
                      ))}
                    {readings.filter((r) => r.sensor_id === selectedSensor.id).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                          No readings yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Alert Thresholds — editable */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Alert Thresholds</CardTitle>
                    <CardDescription>
                      Alerts are triggered when readings exceed these limits
                    </CardDescription>
                  </div>
                  {!editingThresholds ? (
                    <Button variant="outline" size="sm" onClick={handleStartEditThresholds}>
                      <Edit2 className="h-4 w-4 mr-1" /> Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingThresholds(false)}>
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveThresholds}>
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {editingThresholds ? (
                  <>
                    {/* Add new threshold row */}
                    <div className="flex gap-2 items-end">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Reading Type</Label>
                        <Input
                          placeholder="e.g. temperature"
                          value={editThresholdKey}
                          onChange={(e) => setEditThresholdKey(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="w-24 space-y-1">
                        <Label className="text-xs">Min</Label>
                        <Input
                          type="number"
                          placeholder="Min"
                          value={editThresholdMin}
                          onChange={(e) => setEditThresholdMin(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="w-24 space-y-1">
                        <Label className="text-xs">Max</Label>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={editThresholdMax}
                          onChange={(e) => setEditThresholdMax(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <Button variant="outline" size="sm" onClick={handleAddEditThreshold} className="h-8">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Separator />
                    {/* Existing thresholds */}
                    {Object.entries(editThresholds).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No thresholds set.</p>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(editThresholds).map(([key, val]) => (
                          <div key={key} className="flex items-center gap-3 text-sm bg-muted/50 p-2 rounded-lg">
                            <Badge>{key}</Badge>
                            <div className="flex gap-4 flex-1">
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground text-xs">Min:</span>
                                <Input
                                  type="number"
                                  value={val.min ?? ""}
                                  onChange={(e) =>
                                    setEditThresholds((prev) => ({
                                      ...prev,
                                      [key]: {
                                        ...prev[key],
                                        min: e.target.value !== "" ? parseFloat(e.target.value) : undefined,
                                      },
                                    }))
                                  }
                                  className="h-7 w-24 text-sm"
                                  placeholder="—"
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground text-xs">Max:</span>
                                <Input
                                  type="number"
                                  value={val.max ?? ""}
                                  onChange={(e) =>
                                    setEditThresholds((prev) => ({
                                      ...prev,
                                      [key]: {
                                        ...prev[key],
                                        max: e.target.value !== "" ? parseFloat(e.target.value) : undefined,
                                      },
                                    }))
                                  }
                                  className="h-7 w-24 text-sm"
                                  placeholder="—"
                                />
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={() =>
                                setEditThresholds((prev) => {
                                  const n = { ...prev };
                                  delete n[key];
                                  return n;
                                })
                              }
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : Object.entries(selectedSensor.alert_thresholds || {}).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No thresholds configured. Click Edit to add some.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(selectedSensor.alert_thresholds).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex items-center gap-3 text-sm p-2 bg-muted/30 rounded-lg"
                      >
                        <Badge variant="outline">{key}</Badge>
                        {val.min != null && (
                          <span>
                            Min: <strong>{val.min}</strong>
                          </span>
                        )}
                        {val.max != null && (
                          <span>
                            Max: <strong>{val.max}</strong>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location */}
            {selectedSensor.location_lat && selectedSensor.location_lng && (
              <Card>
                <CardHeader>
                  <CardTitle>Sensor Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {selectedSensor.location_label || "GPS Location"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {selectedSensor.location_lat}, {selectedSensor.location_lng}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps?q=${selectedSensor.location_lat},${selectedSensor.location_lng}`,
                          "_blank"
                        )
                      }
                    >
                      Open in Maps
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}
      </Tabs>
    </AdminPageLayout>
  );
}
