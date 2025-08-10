
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  MapPin, 
  Calendar, 
  MessageSquare,
  UserPlus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AddEmployeeModal } from "@/components/admin/modals/AddEmployeeModal";

export function QuickActionsPanel() {
  const navigate = useNavigate();
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  
  const quickActions = [
    {
      title: "Add Employee",
      icon: <UserPlus className="h-4 w-4 mr-2" />,
      action: () => setAddEmployeeOpen(true)
    },
    {
      title: "Analytics",
      icon: <Users className="h-4 w-4 mr-2" />,
      action: () => navigate("/admin/advanced-analytics")
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
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                variant="tile"
                className="h-28"
                onClick={action.action}
              >
                {/* Larger icon to match mockup style */}
                <span className="mr-3 [&>svg]:size-6">{action.icon}</span>
                <span className="text-base font-semibold">{action.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <AddEmployeeModal
        open={addEmployeeOpen}
        onOpenChange={setAddEmployeeOpen}
        onSuccess={() => {
          setAddEmployeeOpen(false);
          navigate("/admin/employees");
        }}
      />
    </>
  );
}
