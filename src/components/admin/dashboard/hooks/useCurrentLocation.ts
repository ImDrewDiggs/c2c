
import { useState, useEffect } from "react";
import { Location } from "@/types/map";

/**
 * Hook to get the user's current location
 * Returns the current location or a default location if geolocation fails
 */
export function useCurrentLocation() {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

  useEffect(() => {
    // Use a lightweight function for geolocation to avoid React rendering issues
    const getLocation = () => {
      if ("geolocation" in navigator) {
        try {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setCurrentLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => {
              console.error("Geolocation error:", error);
              // Fall back to New York coordinates
              setCurrentLocation({
                latitude: 40.7128,
                longitude: -74.0060,
              });
            },
            { 
              enableHighAccuracy: false,
              timeout: 5000,
              maximumAge: 10000
            }
          );
        } catch (error) {
          console.error("Error requesting geolocation:", error);
          // Fallback for any other errors
          setCurrentLocation({
            latitude: 40.7128,
            longitude: -74.0060,
          });
        }
      } else {
        // Fallback if geolocation is not available
        setCurrentLocation({
          latitude: 40.7128,
          longitude: -74.0060,
        });
      }
    };

    getLocation();
  }, []);

  return currentLocation;
}
