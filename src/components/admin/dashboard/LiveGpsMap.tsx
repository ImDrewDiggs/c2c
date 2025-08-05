
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { House, EmployeeLocation, Location } from "@/types/map";
import Map from "@/components/Map/Map";
import { MapPin } from "lucide-react";

interface LiveGpsMapProps {
  employeeLocations: EmployeeLocation[];
  serviceAreas: House[];
  currentLocation: Location | null;
}

export function LiveGpsMap({ employeeLocations, serviceAreas, currentLocation }: LiveGpsMapProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Live GPS Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full flex items-center justify-center bg-muted rounded-lg">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-semibold mb-2">GPS Map Loading...</p>
            <p className="text-sm text-muted-foreground">
              Map functionality temporarily disabled for stability.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {employeeLocations.filter(e => e.is_online).length} active employees • {serviceAreas.length} service areas
            </p>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          <p>Showing {employeeLocations.filter(e => e.is_online).length} active employees and {serviceAreas.length} service areas</p>
        </div>
      </CardContent>
    </Card>
  );
}
