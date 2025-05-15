
import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "./types/dashboardTypes";
import { Users, UserPlus, Briefcase, CheckCircle, Clock } from "lucide-react";

interface StatsOverviewProps {
  stats: DashboardStats;
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <Users className="h-5 w-5 text-blue-500" />,
      description: "Registered accounts"
    },
    {
      title: "New Signups",
      value: stats.newSignups,
      icon: <UserPlus className="h-5 w-5 text-green-500" />,
      description: "This week"
    },
    {
      title: "Active Employees",
      value: stats.activeEmployees,
      icon: <Briefcase className="h-5 w-5 text-purple-500" />,
      description: "Current staff"
    },
    {
      title: "Completed Jobs",
      value: stats.completedJobs,
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
      description: "Finished tasks"
    },
    {
      title: "Pending Jobs",
      value: stats.pendingJobs,
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      description: "Awaiting completion"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </div>
              <div className="p-2 bg-muted rounded-full">
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
