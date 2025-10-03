import { BackgroundGeolocationPlugin } from '@capacitor-community/background-geolocation';
import { registerPlugin } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>('BackgroundGeolocation');

export class BackgroundGPSService {
  private static watchId: string | null = null;
  private static isTracking = false;

  /**
   * Start background GPS tracking
   * This will continue tracking even when the app is closed
   */
  static async startTracking(userId: string): Promise<boolean> {
    // Only works on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.warn('Background GPS tracking only works on native platforms');
      return false;
    }

    if (this.isTracking) {
      console.log('GPS tracking already active');
      return true;
    }

    try {
      // Start watching position in background
      // requestPermissions is handled in the addWatcher options
      this.watchId = await BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: 'Tracking your work location',
          backgroundTitle: 'GPS Tracking Active',
          requestPermissions: true,
          stale: false,
          distanceFilter: 50 // Update every 50 meters
        },
        async (location, error) => {
          if (error) {
            console.error('Background GPS error:', error);
            return;
          }

          if (location) {
            // Save location to database
            await this.saveLocationUpdate(userId, location);
          }
        }
      );

      this.isTracking = true;
      console.log('Background GPS tracking started');
      return true;
    } catch (error) {
      console.error('Failed to start GPS tracking:', error);
      return false;
    }
  }

  /**
   * Stop background GPS tracking
   */
  static async stopTracking(): Promise<void> {
    if (!this.watchId) {
      return;
    }

    try {
      await BackgroundGeolocation.removeWatcher({ id: this.watchId });
      this.watchId = null;
      this.isTracking = false;
      console.log('Background GPS tracking stopped');
    } catch (error) {
      console.error('Failed to stop GPS tracking:', error);
    }
  }

  /**
   * Save location update to database
   */
  private static async saveLocationUpdate(
    userId: string,
    location: { latitude: number; longitude: number; accuracy?: number; timestamp?: number }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('employee_locations')
        .upsert({
          employee_id: userId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          recorded_at: new Date(location.timestamp || Date.now()).toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'employee_id'
        });

      if (error) {
        console.error('Failed to save location:', error);
      }
    } catch (error) {
      console.error('Error saving location update:', error);
    }
  }

  /**
   * Check if tracking is currently active
   */
  static isActive(): boolean {
    return this.isTracking;
  }
}
