
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, RotateCw } from "lucide-react";
import { House, Assignment, Location } from "@/types/map";
import { useToast } from "@/hooks/use-toast";

interface RouteOptimizerProps {
  selectedAssignment: Assignment | null;
  currentLocation: Location | null;
  onClose: () => void;
}

export function RouteOptimizer({ selectedAssignment, currentLocation, onClose }: RouteOptimizerProps) {
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [routeOrder, setRouteOrder] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedAssignment && currentLocation) {
      calculateRoute();
    }
  }, [selectedAssignment, currentLocation]);

  const calculateRoute = async () => {
    if (!selectedAssignment?.house || !currentLocation) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot calculate route: missing location data",
      });
      return;
    }

    setLoading(true);

    try {
      // Calculate straight-line distance (Haversine formula)
      const R = 3959; // Earth's radius in miles
      const lat1 = currentLocation.latitude * Math.PI / 180;
      const lat2 = selectedAssignment.house.latitude * Math.PI / 180;
      const dLat = (selectedAssignment.house.latitude - currentLocation.latitude) * Math.PI / 180;
      const dLng = (selectedAssignment.house.longitude - currentLocation.longitude) * Math.PI / 180;
      
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      // Estimate time (assume 25 mph average with traffic)
      const minutes = Math.round((distance / 25) * 60);
      
      setEstimatedDistance(`${distance.toFixed(1)} miles`);
      setEstimatedTime(`${minutes} min`);
      
      // Get route order if available
      if ('route_order' in selectedAssignment && selectedAssignment.route_order) {
        setRouteOrder(selectedAssignment.route_order as number);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error calculating route:', error);
      toast({
        variant: "destructive",
        title: "Route Calculation Failed",
        description: "Unable to calculate the best route. Please try again.",
      });
      setLoading(false);
    }
  };

  const openMapsApp = () => {
    if (!selectedAssignment?.house) return;
    
    const { latitude, longitude, address } = selectedAssignment.house;
    const encodedAddress = encodeURIComponent(address);
    
    // Create a URL that will open in the device's default map app
    let mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodedAddress}`;
    
    // On iOS, Apple Maps can be used instead
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      mapsUrl = `maps://maps.apple.com/?daddr=${latitude},${longitude}&q=${encodedAddress}`;
    }
    
    window.open(mapsUrl, '_blank');
  };

  if (!selectedAssignment || !selectedAssignment.house) {
    return null;
  }

  return (
    <Card className="border-t-4 border-t-primary">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">Optimal Route</CardTitle>
          <div className="flex gap-2">
            {routeOrder && (
              <Badge variant="secondary">Stop #{routeOrder}</Badge>
            )}
            <Badge variant="outline">{selectedAssignment.status}</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Starting Point</div>
              <div className="font-medium">Your Current Location</div>
            </div>
          </div>
          
          <div className="ml-6 h-6 border-l-2 border-dashed border-muted-foreground"></div>
          
          <div className="flex items-start gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <MapPin className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Destination</div>
              <div className="font-medium">{selectedAssignment.house.address}</div>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Estimated Time</div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4 text-primary" />
                <span className="font-medium">
                  {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : estimatedTime || "Calculating..."}
                </span>
              </div>
            </div>
            
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Distance</div>
              <div className="flex items-center">
                <Navigation className="mr-1 h-4 w-4 text-primary" />
                <span className="font-medium">
                  {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : estimatedDistance || "Calculating..."}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" onClick={openMapsApp}>
          <Navigation className="mr-2 h-4 w-4" />
          Navigate
        </Button>
        
        <Button variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
}
