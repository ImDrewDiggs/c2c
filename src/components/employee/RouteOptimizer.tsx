
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, ChevronRight, RotateCw } from "lucide-react";
import { House, Assignment, Location } from "@/types/map";
import { useToast } from "@/hooks/use-toast";

interface RouteOptimizerProps {
  selectedAssignment: Assignment | null;
  currentLocation: Location | null;
  onClose: () => void;
}

export function RouteOptimizer({ selectedAssignment, currentLocation, onClose }: RouteOptimizerProps) {
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
  const [estimatedDistance, setEstimatedDistance] = useState<string | null>(null);
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
      // Calculate route using the Mapbox Directions API
      // Note: In a real app, this should be done through a Supabase Edge Function
      // to protect your Mapbox API key
      const start = `${currentLocation.longitude},${currentLocation.latitude}`;
      const end = `${selectedAssignment.house.longitude},${selectedAssignment.house.latitude}`;
      
      // Simulate API response
      setTimeout(() => {
        // Sample estimation data (would come from the API)
        const distance = ((Math.random() * 10) + 2).toFixed(1);
        const minutes = Math.floor((Math.random() * 30) + 10);
        
        setEstimatedDistance(`${distance} miles`);
        setEstimatedTime(`${minutes} min`);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error calculating route:', error);
      toast({
        variant: "destructive",
        title: "Route Calculation Failed",
        description: "Unable to calculate the best route. Please try again.",
      });
    } finally {
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
    <Card className="border-t-4 border-t-blue-500">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">Optimal Route</CardTitle>
          <Badge variant="outline">{selectedAssignment.status}</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <MapPin className="h-5 w-5 text-blue-500" />
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
                <Clock className="mr-1 h-4 w-4 text-blue-500" />
                <span className="font-medium">
                  {loading ? <RotateCw className="h-4 w-4 animate-spin" /> : estimatedTime || "Calculating..."}
                </span>
              </div>
            </div>
            
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-xs text-muted-foreground">Distance</div>
              <div className="flex items-center">
                <Navigation className="mr-1 h-4 w-4 text-blue-500" />
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
