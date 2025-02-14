
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

export function StatsCard({ icon: Icon, label, value }: StatsCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center space-x-4">
        <Icon className="h-10 w-10 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
      </div>
    </Card>
  );
}
