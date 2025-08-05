
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  MapPin, 
  Calendar, 
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuickActionsPanel() {
  const navigate = useNavigate();
  
  const quickActions = [
    {
      title: "Analytics",
      icon: <Users className="h-4 w-4 mr-2" />,
      action: () => navigate("/admin/analytics")
    },
    {
      title: "Fleet Management",
      icon: <MapPin className="h-4 w-4 mr-2" />,
      action: () => navigate("/admin/fleet")
    },
    {
      title: "Schedule Jobs",
      icon: <Calendar className="h-4 w-4 mr-2" />,
      action: () => navigate("/admin/schedules")
    },
    {
      title: "Site Settings",
      icon: <MessageSquare className="h-4 w-4 mr-2" />,
      action: () => navigate("/admin/settings")
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto py-4 justify-start"
              onClick={action.action}
            >
              {action.icon}
              <span>{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
