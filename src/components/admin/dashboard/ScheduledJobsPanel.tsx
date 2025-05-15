
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduledJob } from "./types/dashboardTypes";
import { Badge } from "@/components/ui/badge";
import { CalendarCheck } from "lucide-react";
import { format, parseISO, isPast } from "date-fns";

interface ScheduledJobsPanelProps {
  jobs: ScheduledJob[];
}

export function ScheduledJobsPanel({ jobs }: ScheduledJobsPanelProps) {
  // Filter to only show pending jobs
  const pendingJobs = jobs.filter(job => job.status === 'pending');
  
  // Sort by assignment date
  const sortedJobs = [...pendingJobs].sort((a, b) => {
    const dateA = new Date(a.assigned_date);
    const dateB = new Date(b.assigned_date);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <CalendarCheck className="h-5 w-5 mr-2" />
          Scheduled Jobs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedJobs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pending jobs scheduled</p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-3">
            {sortedJobs.map((job) => {
              const isOverdue = job.assigned_date ? isPast(new Date(job.assigned_date)) : false;
              const dueDate = job.assigned_date ? format(parseISO(job.assigned_date), 'MMM d, yyyy h:mm a') : 'Not scheduled';
              
              return (
                <div key={job.id} className="p-3 rounded-md bg-muted/50">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium text-sm">{job.house?.address || 'Unknown location'}</h4>
                    <Badge variant={isOverdue ? "destructive" : "default"}>
                      {isOverdue ? "Overdue" : "Pending"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    <p>Due: {dueDate}</p>
                    <p>Assigned to: Employee {job.employee_id?.substring(0, 8) || 'Unassigned'}</p>
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
