import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface WorkSession {
  id: string;
  employee_id: string;
  status: "active" | "completed" | string;
  clock_in_time: string;
  clock_out_time?: string | null;
}

/**
 * Tracks an employee's GPS location while they are clocked in.
 *
 * - Captures a high-accuracy snapshot on clock-in / clock-out via TimeTracker.
 * - Records medium-accuracy positions every 30 seconds while a work session is active.
 * - Sends locations to the record-location edge function so writes are server-validated.
 *
 * This hook is web-first. On personal phones it only works while the browser tab is active.
 * For company phones, the same edge function can be called from a Capacitor background plugin.
 */
export function useEmployeeLocationTracking(userId: string | undefined) {
  const [permissionState, setPermissionState] = useState<PermissionState | "unsupported">("prompt");
  const [isTracking, setIsTracking] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastUploadRef = useRef<number>(0);
  const activeSessionRef = useRef<WorkSession | null>(null);
  const locationQueueRef = useRef<LocationCoordinates | null>(null);

  /**
   * Upload a location to the server. Throttled to once per 30 seconds for continuous pings.
   */
  const uploadLocation = useCallback(async (location: LocationCoordinates, force = false) => {
    if (!userId) return;

    const now = Date.now();
    if (!force && now - lastUploadRef.current < 30_000) {
      // Save the latest location so the next allowed upload uses the most recent coordinates
      locationQueueRef.current = location;
      return;
    }

    lastUploadRef.current = now;
    locationQueueRef.current = null;

    try {
      const { error } = await supabase.functions.invoke("record-location", {
        body: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: new Date().toISOString(),
        },
      });

      if (error) throw error;
      setLastError(null);
    } catch (error) {
      console.error("Location upload failed:", error);
      setLastError("Unable to update location. Please check your connection.");
    }
  }, [userId]);

  /**
   * Check the browser's geolocation permission state.
   */
  useEffect(() => {
    if (!("permissions" in navigator)) {
      setPermissionState("unsupported");
      return;
    }

    let permissionStatus: PermissionStatus | null = null;

    navigator.permissions.query({ name: "geolocation" as PermissionName }).then((status) => {
      permissionStatus = status;
      setPermissionState(status.state as PermissionState);

      status.addEventListener("change", () => {
        setPermissionState(status.state as PermissionState);
      });
    }).catch(() => {
      setPermissionState("prompt");
    });

    return () => {
      if (permissionStatus) {
        permissionStatus.removeEventListener("change", () => {});
      }
    };
  }, []);

  /**
   * Subscribe to the active work session for this employee.
   */
  useEffect(() => {
    if (!userId) return;

    const fetchActiveSession = async () => {
      const { data, error } = await supabase
        .from("work_sessions")
        .select("id, employee_id, status, clock_in_time, clock_out_time")
        .eq("employee_id", userId)
        .eq("status", "active")
        .order("clock_in_time", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch active session:", error);
        return;
      }

      activeSessionRef.current = data as WorkSession | null;
      setIsTracking(!!data);
    };

    fetchActiveSession();

    const channel = supabase
      .channel(`work-sessions-${userId}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "work_sessions",
          filter: `employee_id=eq.${userId}`,
        },
        () => {
          fetchActiveSession();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel).catch((err) => {
        console.error("Error removing work session channel:", err);
      });
    };
  }, [userId]);

  /**
   * Start or stop GPS watching based on the active session state.
   */
  useEffect(() => {
    if (!userId || !isTracking || !("geolocation" in navigator)) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (permissionState === "denied") {
      setLastError("Location permission is denied. Enable location services in your browser settings.");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const location: LocationCoordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        await uploadLocation(location);
      },
      (error) => {
        console.error("Geolocation watch error:", error);
        setLastError("GPS signal unavailable. Location updates may be delayed.");
      },
      {
        enableHighAccuracy: false,
        maximumAge: 30_000,
        timeout: 10_000,
      },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [userId, isTracking, permissionState, uploadLocation]);

  /**
   * Flush any queued location on the 30-second throttle boundary.
   */
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      if (locationQueueRef.current) {
        uploadLocation(locationQueueRef.current, true);
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [isTracking, uploadLocation]);

  /**
   * Capture a high-accuracy snapshot (used by TimeTracker on clock-in/out).
   */
  const captureSnapshot = useCallback((): Promise<LocationCoordinates | null> => {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          uploadLocation(location, true);
          resolve(location);
        },
        (error) => {
          console.error("Snapshot geolocation error:", error);
          setLastError("Could not capture location snapshot.");
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15_000,
          maximumAge: 0,
        },
      );
    });
  }, [uploadLocation]);

  return {
    isTracking,
    permissionState,
    lastError,
    captureSnapshot,
  };
}
