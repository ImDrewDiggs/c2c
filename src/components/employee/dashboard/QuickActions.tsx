
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface QuickActionsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function QuickActions({ activeTab, setActiveTab }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Manage your tasks and track your time</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          onClick={() => setActiveTab("time-tracker")}
          variant={activeTab === "time-tracker" ? "default" : "tile"}
          className="h-28"
        >
          Time Tracker
        </Button>
        <Button
          onClick={() => setActiveTab("job-assignments")}
          variant={activeTab === "job-assignments" ? "default" : "tile"}
          className="h-28"
        >
          Job Assignments
        </Button>
        <Button
          onClick={() => setActiveTab("route-optimizer")}
          variant={activeTab === "route-optimizer" ? "default" : "tile"}
          className="h-28"
        >
          Route Optimizer
        </Button>
      </CardContent>
    </Card>
  );
}
