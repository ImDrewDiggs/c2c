
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeTracker } from "@/components/admin/EmployeeTracker";
import { useAdminDashboard } from "@/components/admin/dashboard/AdminDashboardProvider";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminGpsTracking() {
  const { employeeLocations, currentLocation } = useAdminDashboard();
  const [isLoading, setIsLoading] = useState(true);
  
  // Add a small delay to ensure data is properly loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <AdminPageLayout 
      title="GPS Tracking" 
      description="Real-time employee location tracking"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Locations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading employee location data...</span>
                </div>
              ) : (
                <EmployeeTracker 
                  employeeLocations={employeeLocations || []} 
                  currentLocation={currentLocation || null}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
}
