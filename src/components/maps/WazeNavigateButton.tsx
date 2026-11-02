import { Navigation } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { buildWazeNavigationUrl, openWazeNavigation, type WazeDestination } from "@/lib/waze";

interface WazeNavigateButtonProps extends Omit<ButtonProps, "onClick" | "asChild"> {
  destination: WazeDestination;
  label?: string;
}

/**
 * Navigation button that opens the Waze app on phones (falling back to the
 * Waze website when the app is missing) and the Waze website on desktop.
 */
export function WazeNavigateButton({
  destination,
  label = "Navigate with Waze",
  ...buttonProps
}: WazeNavigateButtonProps) {
  const hasDestination = buildWazeNavigationUrl(destination) !== null;

  if (!hasDestination) {
    return (
      <Button {...buttonProps} disabled aria-label="No address available for navigation">
        <Navigation className="mr-1 h-3 w-3" />
        {label}
      </Button>
    );
  }

  return (
    <Button
      {...buttonProps}
      onClick={(e) => {
        e.stopPropagation();
        openWazeNavigation(destination);
      }}
      aria-label={`${label}: ${destination.address ?? "destination"}`}
    >
      <Navigation className="mr-1 h-3 w-3" />
      {label}
    </Button>
  );
}
