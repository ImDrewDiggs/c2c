
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeTracker } from "@/components/admin/EmployeeTracker";
import { useAdminDashboard } from "@/components/admin/dashboard/AdminDashboardProvider";
import { useState, useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

function GpsTrackingContent() {
  const dashboardContext = useAdminDashboard();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Add a small delay to ensure data is properly loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Increased from 500ms to 1000ms for more reliability
    
    return () => clearTimeout(timer);
  }, []);

  // Error handling for geolocation
  useEffect(() => {
    if (dashboardContext && !dashboardContext.currentLocation) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        if (result.state === 'denied') {
          setError('Location access is blocked. Please enable location services in your browser settings.');
          toast({
            variant: "destructive",
            title: "Location access denied",
            description: "GPS tracking requires location permissions."
          });
        }
      }).catch(err => {
        console.error("Error checking location permissions:", err);
      });
    }
  }, [dashboardContext, toast]);
  
  if (!dashboardContext) {
    return (
      <div className="h-full flex items-center justify-center">
        <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
        <p className="text-muted-foreground">Dashboard context not available</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>{error}</p>
      </div>
    );
  }
  
  const { employeeLocations, currentLocation } = dashboardContext;
  console.log("GpsTrackingContent rendering with:", { 
    employeeCount: employeeLocations?.length || 0,
    hasCurrentLocation: !!currentLocation
  });
  
  return (
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
  );
}

export default function AdminGpsTracking() {
  const { user, userData, isSuperAdmin, loading } = useAuth();

  // Authorization check - only admins should access GPS tracking
  if (!loading && (!userData || (userData.role !== 'admin' && !isSuperAdmin))) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminPageLayout 
      title="GPS Tracking" 
      description="Real-Time Employee Location Tracking"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Employee Locations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ErrorBoundary
              fallbackRender={({ error }) => (
                <div className="p-6 text-center">
                  <div className="flex flex-col items-center text-destructive mb-4">
                    <AlertTriangle className="h-10 w-10 mb-2" />
                    <h3 className="font-semibold">Error Loading GPS Tracking</h3>
                  </div>
                  <p className="text-muted-foreground mb-2">
                    There was an error loading the GPS tracking data.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Error details: {error.message}
                  </p>
                </div>
              )}
            >
              <GpsTrackingContent />
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>
    </AdminPageLayout>
  );
}
