import { Capacitor } from "@capacitor/core";
import type { Location } from "@/types/map";

const WAZE_BASE_URL = "https://waze.com/ul";
const WAZE_APP_SCHEME = "waze://";
const WAZE_LIVE_MAP_EMBED = "https://embed.waze.com/iframe";
/** How long to wait for the Waze app to open before falling back to the web. */
const APP_OPEN_FALLBACK_MS = 1500;

export interface WazeDestination {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}

const isValidCoordinate = (lat: unknown, lng: unknown): lat is number =>
  typeof lat === "number" &&
  typeof lng === "number" &&
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 90 &&
  Math.abs(lng) <= 180 &&
  !(lat === 0 && lng === 0);

/** Shared destination params: coordinates when valid, otherwise the address. */
function buildDestinationParams(destination: WazeDestination): URLSearchParams | null {
  const params = new URLSearchParams();
  const { latitude, longitude, address } = destination;

  if (isValidCoordinate(latitude, longitude)) {
    params.set("ll", `${latitude.toFixed(6)},${(longitude as number).toFixed(6)}`);
  } else {
    const query = address?.trim().slice(0, 300);
    if (!query) return null;
    params.set("q", query);
  }

  params.set("navigate", "yes");
  return params;
}

/**
 * Builds a Waze universal link that opens the Waze app (or website) with
 * turn-by-turn navigation. Coordinates are preferred; address is the fallback.
 * Returns null when no usable destination exists.
 */
export function buildWazeNavigationUrl(destination: WazeDestination): string | null {
  const params = buildDestinationParams(destination);
  if (!params) return null;
  params.set("utm_source", "can2curb");
  return `${WAZE_BASE_URL}?${params.toString()}`;
}

/**
 * Builds a native `waze://` deep link that opens the Waze app directly.
 * Used inside the Capacitor mobile app where universal links open a browser.
 * Returns null when no usable destination exists.
 */
export function buildWazeAppUrl(destination: WazeDestination): string | null {
  const params = buildDestinationParams(destination);
  if (!params) return null;
  return `${WAZE_APP_SCHEME}?${params.toString()}`;
}

/**
 * Opens Waze navigation to a destination.
 * - Native mobile app: tries the installed Waze app first, falls back to the
 *   Waze website when the app is not installed.
 * - Desktop/mobile browser: opens the Waze universal link in a new tab.
 * Returns false when the destination is unusable.
 */
export function openWazeNavigation(destination: WazeDestination): boolean {
  const webUrl = buildWazeNavigationUrl(destination);
  if (!webUrl) return false;

  if (!Capacitor.isNativePlatform()) {
    window.open(webUrl, "_blank", "noopener,noreferrer");
    return true;
  }

  const appUrl = buildWazeAppUrl(destination);
  if (!appUrl) {
    window.open(webUrl, "_blank", "noopener,noreferrer");
    return true;
  }

  // If the Waze app opens, the page hides and the fallback never fires.
  const fallbackTimer = window.setTimeout(() => {
    window.open(webUrl, "_blank", "noopener,noreferrer");
  }, APP_OPEN_FALLBACK_MS);

  const cancelFallback = () => {
    window.clearTimeout(fallbackTimer);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("pagehide", cancelFallback);
  };
  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") cancelFallback();
  };

  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("pagehide", cancelFallback);
  window.location.href = appUrl;
  return true;
}

/** Waze live traffic map embed URL centered on a location. */
export function buildWazeLiveMapUrl(center: Location, zoom = 12): string {
  const safeZoom = Math.min(17, Math.max(3, Math.round(zoom)));
  const params = new URLSearchParams({
    zoom: String(safeZoom),
    lat: center.latitude.toFixed(6),
    lon: center.longitude.toFixed(6),
    pin: "1",
  });
  return `${WAZE_LIVE_MAP_EMBED}?${params.toString()}`;
}

/** Greater Cincinnati default map center. */
export const CINCINNATI_CENTER: Location = { latitude: 39.1031, longitude: -84.512 };
