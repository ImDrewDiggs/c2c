import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Users, Route } from "lucide-react";
import { optimizeRoutes, calculateRouteDistance } from "@/utils/routeOptimization";
import { House, EmployeeLocation } from "@/types/map";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AutoAssignRoutesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RoutePreview {
  employeeId: string;
  employeeName: string;
  houseCount: number;
  totalDistance: number;
  houses: House[];
}

export function AutoAssignRoutesModal({ open, onOpenChange }: AutoAssignRoutesModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [unassignedHouses, setUnassignedHouses] = useState<House[]>([]);
  const [onlineEmployees, setOnlineEmployees] = useState<EmployeeLocation[]>([]);
  const [routePreview, setRoutePreview] = useState<RoutePreview[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get unassigned houses (no pending/assigned assignments)
      const { data: allHouses, error: housesError } = await supabase
        .from("houses")
        .select("*");

      if (housesError) throw housesError;

      // Get existing assignments to filter out assigned houses
      const { data: existingAssignments, error: assignmentsError } = await supabase
        .from("assignments")
        .select("house_id")
        .in("status", ["pending", "assigned"]);

      if (assignmentsError) throw assignmentsError;

      const assignedHouseIds = new Set(existingAssignments?.map(a => a.house_id) || []);
      const unassigned = allHouses?.filter(h => !assignedHouseIds.has(h.id)) || [];
      setUnassignedHouses(unassigned);

      // Get online employee locations
      const { data: locations, error: locationsError } = await supabase
        .from("employee_locations")
        .select("*")
        .eq("is_online", true);

      if (locationsError) throw locationsError;

      const employeeLocs: EmployeeLocation[] = locations?.map(loc => ({
        employee_id: loc.employee_id,
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
        is_online: loc.is_online,
        timestamp: loc.timestamp,
        last_seen_at: loc.last_seen_at,
      })) || [];

      setOnlineEmployees(employeeLocs);

      // Auto-generate preview
      if (unassigned.length > 0 && employeeLocs.length > 0) {
        generatePreview(unassigned, employeeLocs);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreview = async (houses: House[], employees: EmployeeLocation[]) => {
    setIsOptimizing(true);
    try {
      const assignments = optimizeRoutes(houses, employees);

      // Group by employee for preview
      const employeeMap = new Map<string, RoutePreview>();

      for (const assignment of assignments) {
        if (!employeeMap.has(assignment.employee_id)) {
          // Get employee info
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", assignment.employee_id)
            .single();

          employeeMap.set(assignment.employee_id, {
            employeeId: assignment.employee_id,
            employeeName: profile?.full_name || profile?.email || "Unknown",
            houseCount: 0,
            totalDistance: 0,
            houses: [],
          });
        }

        const preview = employeeMap.get(assignment.employee_id)!;
        const house = houses.find(h => h.id === assignment.house_id);
        if (house) {
          preview.houses.push(house);
          preview.houseCount++;
        }
      }

      // Calculate distances for each route
      for (const preview of employeeMap.values()) {
        preview.totalDistance = calculateRouteDistance(preview.houses);
      }

      setRoutePreview(Array.from(employeeMap.values()));
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleAssign = async () => {
    if (unassignedHouses.length === 0 || onlineEmployees.length === 0) {
      toast({
        title: "Cannot Assign",
        description: "No unassigned houses or online employees available",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const assignments = optimizeRoutes(unassignedHouses, onlineEmployees);

      // Insert all assignments with route optimization data
      const assignmentRecords = assignments.map(a => ({
        house_id: a.house_id,
        employee_id: a.employee_id,
        status: "assigned",
        route_order: a.route_order,
        cluster_id: a.cluster_id,
        optimized_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("assignments")
        .insert(assignmentRecords);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Assigned ${assignments.length} routes to ${routePreview.length} employees with optimized ordering`,
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error assigning routes:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign routes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Auto-Assign Optimized Routes
          </DialogTitle>
          <DialogDescription>
            Automatically groups nearby addresses and assigns them to the closest employee with optimized route ordering.
          </DialogDescription>
        </DialogHeader>

        {isLoading || isOptimizing ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3">{isOptimizing ? "Optimizing routes..." : "Loading..."}</span>
          </div>
        ) : (
          <div className="space-y-4">
            {unassignedHouses.length === 0 ? (
              <Alert>
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  No unassigned properties available. All properties have existing assignments.
                </AlertDescription>
              </Alert>
            ) : onlineEmployees.length === 0 ? (
              <Alert variant="destructive">
                <Users className="h-4 w-4" />
                <AlertDescription>
                  No online employees available for assignment. Make sure employees have their location sharing enabled.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">Unassigned Properties</div>
                    <div className="text-2xl font-bold">{unassignedHouses.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Online Employees</div>
                    <div className="text-2xl font-bold">{onlineEmployees.length}</div>
                  </div>
                </div>

                {routePreview.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">Route Preview</h3>
                    {routePreview.map((preview, idx) => (
                      <div key={preview.employeeId} className="p-3 border rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{preview.employeeName}</div>
                            <div className="text-sm text-muted-foreground">
                              {preview.houseCount} stops • {preview.totalDistance.toFixed(1)} miles
                            </div>
                          </div>
                          <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Route {idx + 1}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <div className="font-medium mb-1">Optimized stops:</div>
                          <ol className="list-decimal list-inside space-y-0.5">
                            {preview.houses.slice(0, 3).map((house, i) => (
                              <li key={house.id}>{house.address}</li>
                            ))}
                            {preview.houses.length > 3 && (
                              <li className="text-muted-foreground">
                                +{preview.houses.length - 3} more stops...
                              </li>
                            )}
                          </ol>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={isLoading || unassignedHouses.length === 0 || onlineEmployees.length === 0}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign Routes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
