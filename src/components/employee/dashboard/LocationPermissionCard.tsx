import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, AlertTriangle, CheckCircle2 } from "lucide-react";

interface LocationPermissionCardProps {
  permissionState: PermissionState | "unsupported";
  isTracking: boolean;
  error: string | null;
}

/**
 * Onboarding card that explains why GPS access is needed and how to enable it.
 * Shown to employees until location permission is granted and tracking is active.
 */
export function LocationPermissionCard({
  permissionState,
  isTracking,
  error,
}: LocationPermissionCardProps) {
  const requestPermission = async () => {
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      () => {
        // Permission prompt accepted; the hook will detect the state change.
      },
      () => {
        // Permission denied or unavailable; browser will remember the choice.
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
    );
  };

  const isGranted = permissionState === "granted";
  const isDenied = permissionState === "denied";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Tracking
        </CardTitle>
        <CardDescription>
          GPS is used to verify clock-in/out locations and provide live route visibility to dispatch.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDenied ? (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Location access is blocked</p>
              <p className="text-sm mt-1">
                Enable location services in your browser settings, then refresh the page.
              </p>
            </div>
          </div>
        ) : isGranted && isTracking ? (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 text-primary">
            <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Location tracking is active</p>
              <p className="text-sm mt-1">
                Your GPS position is shared while you are clocked in.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Tap below to allow location access. You only need to do this once.
            </p>
            <Button onClick={requestPermission} disabled={isGranted}>
              {isGranted ? "Permission Granted" : "Allow Location Access"}
            </Button>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
