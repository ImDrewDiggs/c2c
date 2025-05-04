
import { Button } from "@/components/ui/button";
import { BadgeCheck, Download, RefreshCw } from "lucide-react";

/**
 * Props interface for DashboardHeader component
 */
interface DashboardHeaderProps {
  isSuperAdmin: boolean; // Flag to indicate if user has super admin privileges
}

/**
 * DashboardHeader - Admin dashboard top section with title and action buttons
 * 
 * Displays the dashboard title, super admin badge (if applicable),
 * and action buttons for refreshing and exporting data.
 */
export function DashboardHeader({ isSuperAdmin }: DashboardHeaderProps) {
  /**
   * Handler for refresh button click
   * Reloads the page to get fresh data
   */
  const handleRefresh = () => {
    window.location.reload();
  };

  /**
   * Handler for export button click
   * Shows a placeholder alert (to be implemented with actual export functionality)
   */
  const handleExport = () => {
    alert("Export functionality would generate reports here");
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      {/* Dashboard title and admin badge */}
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
      
      {/* Action buttons */}
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
