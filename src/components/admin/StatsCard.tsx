
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * Props interface for StatsCard component
 */
interface StatsCardProps {
  icon: LucideIcon;          // Icon to display with the stat
  label: string;             // Description of the stat
  value: string | number;    // Value of the stat
}

/**
 * StatsCard - Displays a single statistic with an icon and label
 * 
 * Used for showing key metrics in the dashboard's StatsOverview section.
 * Each card has a consistent layout with an icon, label, and value.
 */
export function StatsCard({ icon: Icon, label, value }: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-4">
        {/* Icon */}
        <Icon className="h-10 w-10 text-primary" />
        {/* Label and value */}
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </div>
    </Card>
  );
}
