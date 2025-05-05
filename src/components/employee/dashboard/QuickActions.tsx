
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
      <CardContent className="flex flex-wrap gap-4">
        <Button
          onClick={() => setActiveTab("time-tracker")}
          variant={activeTab === "time-tracker" ? "default" : "outline"}
        >
          Time Tracker
        </Button>
        <Button
          onClick={() => setActiveTab("job-assignments")}
          variant={activeTab === "job-assignments" ? "default" : "outline"}
        >
          Job Assignments
        </Button>
        <Button
          onClick={() => setActiveTab("route-optimizer")}
          variant={activeTab === "route-optimizer" ? "default" : "outline"}
        >
          Route Optimizer
        </Button>
      </CardContent>
    </Card>
  );
}
