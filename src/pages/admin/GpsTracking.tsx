
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeTracker } from "@/components/admin/EmployeeTracker";
import { useAdminDashboard } from "@/components/admin/dashboard/AdminDashboardProvider";

export default function AdminGpsTracking() {
  // Get employee locations from the dashboard context
  const { employeeLocations, currentLocation } = useAdminDashboard();
  
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
              <EmployeeTracker 
                employeeLocations={employeeLocations} 
                currentLocation={currentLocation}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
}
