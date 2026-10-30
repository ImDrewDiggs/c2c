import type { Location } from "@/types/map";

const WAZE_BASE_URL = "https://waze.com/ul";
const WAZE_LIVE_MAP_EMBED = "https://embed.waze.com/iframe";

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

/**
 * Builds a Waze universal link that opens the Waze app (or website) with
 * turn-by-turn navigation. Coordinates are preferred; address is the fallback.
 * Returns null when no usable destination exists.
 */
export function buildWazeNavigationUrl(destination: WazeDestination): string | null {
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
  params.set("utm_source", "can2curb");
  return `${WAZE_BASE_URL}?${params.toString()}`;
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
