import { useEffect, useState } from 'react';
import { BackgroundGPSService } from '@/services/BackgroundGPSService';
import { useToast } from '@/hooks/use-toast';

export function useBackgroundGPS(userId: string | undefined, shouldTrack: boolean = false) {
  const [isTracking, setIsTracking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId || !shouldTrack) {
      return;
    }

    // Start tracking when component mounts
    const initializeTracking = async () => {
      const started = await BackgroundGPSService.startTracking(userId);
      setIsTracking(started);
      
      if (started) {
        toast({
          title: 'GPS Tracking Active',
          description: 'Your location is being tracked for work hours',
        });
      }
    };

    initializeTracking();

    // Cleanup: Stop tracking when component unmounts
    return () => {
      BackgroundGPSService.stopTracking();
      setIsTracking(false);
    };
  }, [userId, shouldTrack]);

  const startTracking = async () => {
    if (!userId) return false;
    
    const started = await BackgroundGPSService.startTracking(userId);
    setIsTracking(started);
    return started;
  };

  const stopTracking = async () => {
    await BackgroundGPSService.stopTracking();
    setIsTracking(false);
  };

  return {
    isTracking,
    startTracking,
    stopTracking,
  };
}
