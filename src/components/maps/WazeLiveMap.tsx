import { buildWazeLiveMapUrl, CINCINNATI_CENTER } from "@/lib/waze";
import type { Location } from "@/types/map";

interface WazeLiveMapProps {
  center?: Location | null;
  zoom?: number;
  title?: string;
}

/** Embedded Waze live traffic map (no API key needed). */
export function WazeLiveMap({ center, zoom = 11, title = "Waze live traffic map" }: WazeLiveMapProps) {
  const src = buildWazeLiveMapUrl(center ?? CINCINNATI_CENTER, zoom);
  return (
    <iframe
      src={src}
      title={title}
      className="h-[450px] w-full rounded-b-lg border-0"
      loading="lazy"
      referrerPolicy="no-referrer"
      sandbox="allow-scripts allow-same-origin allow-popups"
      allow="geolocation"
    />
  );
}
