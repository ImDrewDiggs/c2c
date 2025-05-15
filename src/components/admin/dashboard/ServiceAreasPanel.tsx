
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { House } from "@/types/map";
import { MapPin } from "lucide-react";

interface ServiceAreasPanelProps {
  serviceAreas: House[];
}

export function ServiceAreasPanel({ serviceAreas }: ServiceAreasPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Service Areas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {serviceAreas.length === 0 ? (
          <p className="text-muted-foreground text-sm">No service areas found</p>
        ) : (
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {serviceAreas.map((area) => (
              <div key={area.id} className="flex items-center p-2 rounded-md hover:bg-muted">
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium">{area.address}</p>
                  <p className="text-xs text-muted-foreground">
                    {area.latitude.toFixed(5)}, {area.longitude.toFixed(5)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
