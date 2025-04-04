
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { AddEmployeeModal } from "./modals/AddEmployeeModal";

export function QuickLinks() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  
  const handleQuickAction = (action: string) => {
    try {
      // Validate action string to prevent potential XSS or other issues
      if (!action || typeof action !== 'string' || action.length > 100) {
        throw new Error('Invalid action provided');
      }
      
      toast({
        title: "Action Triggered",
        description: `You triggered the "${action}" action. This functionality is coming soon.`,
      });
    } catch (error) {
      console.error("Error in quick action:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while performing this action.",
      });
    }
  };

  // Main actions with their functionality
  const mainActions = [
    {
      label: "Manage Employees",
      icon: Users,
      action: null,
      path: "/admin/employees",
      description: "Add, edit and manage employee accounts"
    },
    {
      label: "Manage Customers",
      icon: User,
      action: () => handleQuickAction("Manage Customers"),
      path: "/admin/customers",
      description: "View and manage customer accounts"
    },
    {
      label: "Update Pricing",
      icon: DollarSign,
      action: () => handleQuickAction("Update Pricing"),
      path: "/admin/pricing",
      description: "Update service pricing plans"
    },
    {
      label: "Schedules",
      icon: Calendar,
      action: () => handleQuickAction("Schedules"),
      path: "/admin/schedules",
      description: "View and manage collection schedules"
    }
  ];

  // Super admin actions with their functionality
  const superAdminActions = [
    {
      label: "Site Settings",
      icon: Settings,
      action: () => handleQuickAction("Site Settings"),
      path: "/admin/settings",
      description: "Configure global site settings"
    },
    {
      label: "Reports",
      icon: FileText,
      action: () => handleQuickAction("Reports"),
      path: "/admin/reports",
      description: "Generate detailed reports"
    },
    {
      label: "Properties",
      icon: Building,
      action: () => handleQuickAction("Properties"),
      path: "/admin/properties",
      description: "Manage service locations"
    },
    {
      label: "Service Logs",
      icon: Trash2,
      action: () => handleQuickAction("Service Logs"),
      path: "/admin/service-logs",
      description: "Review service history and logs"
    },
    {
      label: "GPS Tracking",
      icon: MapPin,
      action: null,
      path: "/admin/gps-tracking",
      description: "Real-time employee location tracking"
    },
    {
      label: "Fleet Management",
      icon: Truck,
      action: () => handleQuickAction("Fleet Management"),
      path: "/admin/fleet",
      description: "Manage waste collection vehicles"
    },
    {
      label: "Advanced Analytics",
      icon: BarChart,
      action: null,
      path: "/admin/advanced-analytics",
      description: "In-depth business analytics"
    },
    {
      label: "Notifications",
      icon: Bell,
      action: () => handleQuickAction("Notifications"),
      path: "/admin/notifications",
      description: "Manage system notifications"
    },
    {
      label: "Knowledge Base",
      icon: HelpCircle,
      action: () => handleQuickAction("Knowledge Base"),
      path: "/admin/knowledge-base",
      description: "Documentation and training resources"
    },
    {
      label: "Support Tickets",
      icon: MessageSquare,
      action: () => handleQuickAction("Support Tickets"),
      path: "/admin/support-tickets",
      description: "View and respond to support requests"
    }
  ];

  const renderButton = (action: any, index: number) => {
    // Validate input action
    if (!action || typeof action.label !== 'string') {
      console.error("Invalid action object", action);
      return null;
    }
    
    const ButtonContent = (
      <>
        {action.icon ? <action.icon className="h-5 w-5" /> : null}
        <span className={action.path ? "" : "text-sm leading-tight"}>{action.label}</span>
        <span className="text-xs text-muted-foreground line-clamp-1">{action.description}</span>
      </>
    );

    try {
      if (action.path) {
        return (
          <Link to={action.path} key={index}>
            <Button variant="outline" className="w-full h-24 flex flex-col gap-1">
              {ButtonContent}
            </Button>
          </Link>
        );
      } else {
        return (
          <Button 
            key={index} 
            variant="outline" 
            className="w-full h-24 flex flex-col gap-1"
            onClick={action.action}
          >
            {ButtonContent}
          </Button>
        );
      }
    } catch (error) {
      console.error(`Error rendering button for ${action.label}:`, error);
      return null;
    }
  };

  return (
    <>
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mainActions.map((action, index) => renderButton(action, index))}
        </div>
        
        {isSuperAdmin && (
          <>
            <div className="mt-6 mb-4 flex items-center">
              <div className="h-px flex-1 bg-muted"></div>
              <span className="px-4 text-sm text-muted-foreground">Super Admin Actions</span>
              <div className="h-px flex-1 bg-muted"></div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {superAdminActions.map((action, index) => renderButton(action, index))}
            </div>
          </>
        )}
      </Card>

      <AddEmployeeModal 
        open={addEmployeeOpen} 
        onOpenChange={setAddEmployeeOpen} 
        onSuccess={() => {
          toast({
            title: "Success",
            description: "Employee has been successfully added.",
          });
        }}
      />
    </>
  );
}
