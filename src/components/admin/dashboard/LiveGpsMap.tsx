
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
        <div className="h-[400px] w-full">
          <Map
            houses={serviceAreas}
            assignments={[]} // We're not showing assignments on this map
            currentLocation={currentLocation}
            employeeLocations={employeeLocations}
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          <p>Showing {employeeLocations.filter(e => e.is_online).length} active employees and {serviceAreas.length} service areas</p>
        </div>
      </CardContent>
    </Card>
  );
}
