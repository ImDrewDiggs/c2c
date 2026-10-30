import { Navigation } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { buildWazeNavigationUrl, type WazeDestination } from "@/lib/waze";

interface WazeNavigateButtonProps extends Omit<ButtonProps, "onClick" | "asChild"> {
  destination: WazeDestination;
  label?: string;
}

export function WazeNavigateButton({
  destination,
  label = "Navigate with Waze",
  ...buttonProps
}: WazeNavigateButtonProps) {
  const url = buildWazeNavigationUrl(destination);

  if (!url) {
    return (
      <Button {...buttonProps} disabled aria-label="No address available for navigation">
        <Navigation className="mr-1 h-3 w-3" />
        {label}
      </Button>
    );
  }

  return (
    <Button {...buttonProps} asChild>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        aria-label={`${label}: ${destination.address ?? "destination"}`}
      >
        <Navigation className="mr-1 h-3 w-3" />
        {label}
      </a>
    </Button>
  );
}
