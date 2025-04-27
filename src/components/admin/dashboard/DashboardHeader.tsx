
import { Button } from "@/components/ui/button";
import { BadgeCheck, Download, RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  isSuperAdmin: boolean;
}

export function DashboardHeader({ isSuperAdmin }: DashboardHeaderProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleExport = () => {
    alert("Export functionality would generate reports here");
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          {isSuperAdmin && (
            <BadgeCheck className="h-6 w-6 text-primary" />
          )}
        </div>
        <p className="text-muted-foreground">
          Monitor operations and manage your business
        </p>
      </div>
      
      <div className="flex gap-3 mt-4 md:mt-0">
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        
        {isSuperAdmin && (
          <Button size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
}
