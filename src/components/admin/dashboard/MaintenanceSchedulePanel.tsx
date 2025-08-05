import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Wrench, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface MaintenanceSchedule {
  id: string;
  scheduled_date: string;
  maintenance_type: string;
  status: string;
  vehicles?: {
    vehicle_number: string;
    make: string;
    model: string;
  };
}

interface MaintenanceSchedulePanelProps {
  schedules: MaintenanceSchedule[];
}

export function MaintenanceSchedulePanel({ schedules }: MaintenanceSchedulePanelProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'scheduled':
        return 'default';
      case 'overdue':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Wrench className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Calendar className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Wrench className="h-5 w-5 mr-2" />
          Vehicle Maintenance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {schedules.length === 0 ? (
          <p className="text-muted-foreground text-sm">No maintenance scheduled</p>
        ) : (
          <div className="max-h-[300px] overflow-y-auto space-y-3">
            {schedules.map((schedule) => {
              const scheduledDate = new Date(schedule.scheduled_date);
              const isOverdue = scheduledDate < new Date() && schedule.status !== 'completed';
              const timeLabel = formatDistanceToNow(scheduledDate, { addSuffix: true });
              
              return (
                <div key={schedule.id} className="flex items-center p-2 rounded-md hover:bg-muted">
                  <div className="mr-2">
                    {getStatusIcon(isOverdue ? 'overdue' : schedule.status)}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">
                          {schedule.vehicles?.vehicle_number || 'Unknown Vehicle'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {schedule.maintenance_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {timeLabel}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(isOverdue ? 'overdue' : schedule.status)}>
                        {isOverdue ? 'Overdue' : schedule.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}