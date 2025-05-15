
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityLog } from "./types/dashboardTypes";
import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";

interface ActivityLogsPanelProps {
  logs: ActivityLog[];
}

export function ActivityLogsPanel({ logs }: ActivityLogsPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No activity logs found</p>
        ) : (
          <div className="max-h-[300px] overflow-y-auto space-y-3">
            {logs.map((log) => {
              // Format the timestamp to show how long ago
              const timeAgo = formatDistanceToNow(new Date(log.created_at), { addSuffix: true });
              
              // Format action for display
              const actionFormatted = log.action
                .replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');

              return (
                <div key={log.id} className="flex items-start gap-2">
                  <div className="h-2 w-2 mt-1.5 rounded-full bg-primary"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{actionFormatted}</span>
                      {log.entity_type && <span className="text-muted-foreground"> on {log.entity_type}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{timeAgo}</p>
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
