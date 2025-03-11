
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Settings, 
  DollarSign, 
  FileText, 
  Clock, 
  Calendar, 
  Building, 
  Trash2,
  User,
  MapPin,
  Truck,
  BarChart,
  Bell,
  HelpCircle,
  MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function QuickLinks() {
  const { isSuperAdmin } = useAuth();
  
  const mainActions = [
    {
      label: "Manage Employees",
      icon: Users,
      path: "/admin/employees",
      description: "Add, edit and manage employee accounts"
    },
    {
      label: "Manage Customers",
      icon: User,
      path: "/admin/customers",
      description: "View and manage customer accounts"
    },
    {
      label: "Update Pricing",
      icon: DollarSign,
      path: "/admin/pricing",
      description: "Update service pricing plans"
    },
    {
      label: "Schedules",
      icon: Calendar,
      path: "/admin/schedules",
      description: "View and manage collection schedules"
    }
  ];

  const superAdminActions = [
    {
      label: "Site Settings",
      icon: Settings,
      path: "/admin/settings",
      description: "Configure global site settings"
    },
    {
      label: "Reports",
      icon: FileText,
      path: "/admin/reports",
      description: "Generate detailed reports"
    },
    {
      label: "Properties",
      icon: Building,
      path: "/admin/properties",
      description: "Manage service locations"
    },
    {
      label: "Service Logs",
      icon: Trash2,
      path: "/admin/service-logs",
      description: "Review service history and logs"
    },
    {
      label: "GPS Tracking",
      icon: MapPin,
      path: "/admin/gps-tracking",
      description: "Real-time employee location tracking"
    },
    {
      label: "Fleet Management",
      icon: Truck,
      path: "/admin/fleet",
      description: "Manage waste collection vehicles"
    },
    {
      label: "Advanced Analytics",
      icon: BarChart,
      path: "/admin/advanced-analytics",
      description: "In-depth business analytics"
    },
    {
      label: "Notifications",
      icon: Bell,
      path: "/admin/notifications",
      description: "Manage system notifications"
    },
    {
      label: "Knowledge Base",
      icon: HelpCircle,
      path: "/admin/knowledge-base",
      description: "Documentation and training resources"
    },
    {
      label: "Support Tickets",
      icon: MessageSquare,
      path: "/admin/support-tickets",
      description: "View and respond to support requests"
    }
  ];

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mainActions.map((action, index) => (
          <Link to={action.path} key={index}>
            <Button variant="outline" className="w-full h-24 flex flex-col gap-1">
              <action.icon className="h-5 w-5" />
              <span>{action.label}</span>
              <span className="text-xs text-muted-foreground line-clamp-1">{action.description}</span>
            </Button>
          </Link>
        ))}
      </div>
      
      {isSuperAdmin && (
        <>
          <div className="mt-6 mb-4 flex items-center">
            <div className="h-px flex-1 bg-muted"></div>
            <span className="px-4 text-sm text-muted-foreground">Super Admin Actions</span>
            <div className="h-px flex-1 bg-muted"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {superAdminActions.map((action, index) => (
              <Link to={action.path} key={index}>
                <Button variant="outline" className="w-full h-24 flex flex-col gap-1">
                  <action.icon className="h-5 w-5" />
                  <span className="text-sm leading-tight">{action.label}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{action.description}</span>
                </Button>
              </Link>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
