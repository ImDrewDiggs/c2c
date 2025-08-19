import React, { useState } from "react";
import { 
  Users, 
  CreditCard, 
  Truck, 
  BarChart3, 
  Settings,
  Plus,
  Minus,
  UserPlus,
  Edit3,
  UserX,
  FileText,
  DollarSign,
  TrendingUp,
  Percent,
  RefreshCw,
  Receipt,
  UserCheck,
  Route,
  CheckCircle,
  Trash2,
  Package,
  Bell,
  MessageSquare,
  Wrench,
  Search,
  FileDown,
  Map,
  History
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { AddCustomerModal } from "../modals/AddCustomerModal";
import { EditCustomerModal } from "../modals/EditCustomerModal";
import { CreateSubscriptionModal } from "../modals/CreateSubscriptionModal";
import { QuickSearchModal } from "../modals/QuickSearchModal";

interface ActionButton {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  variant?: "default" | "outline" | "destructive";
}

interface GroupItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  emoji: string;
  actions: ActionButton[];
}

export function ExpandableGroups() {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [showCreateSubscriptionModal, setShowCreateSubscriptionModal] = useState(false);
  const [showQuickSearchModal, setShowQuickSearchModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleGroup = (groupId: string) => {
    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(groupId)) {
      newOpenGroups.delete(groupId);
    } else {
      newOpenGroups.add(groupId);
    }
    setOpenGroups(newOpenGroups);
  };

  // Action handlers
  const handleAddCustomer = () => setShowAddCustomerModal(true);
  const handleEditCustomer = () => {
    // For demo, we'll just open the modal. In real app, you'd select a customer first
    setShowEditCustomerModal(true);
  };
  const handleSuspendService = () => {
    toast({
      title: "Service Suspension",
      description: "Customer service suspension feature coming soon...",
    });
  };
  const handleCreateSubscription = () => setShowCreateSubscriptionModal(true);
  const handleUpgradePlan = () => {
    toast({
      title: "Plan Upgrade",
      description: "Plan upgrade/downgrade feature coming soon...",
    });
  };
  const handleApplyDiscount = () => {
    toast({
      title: "Apply Discount",
      description: "Discount application feature coming soon...",
    });
  };
  const handleIssueRefund = () => {
    toast({
      title: "Issue Refund",
      description: "Refund processing feature coming soon...",
    });
  };
  const handleGenerateInvoice = () => {
    toast({
      title: "Generate Invoice",
      description: "Invoice generation feature coming soon...",
    });
  };
  const handleAssignEmployee = () => {
    toast({
      title: "Assign Employee",
      description: "Employee assignment feature coming soon...",
    });
  };
  const handleOptimizeRoute = () => {
    toast({
      title: "Route Optimization",
      description: "Route optimization feature coming soon...",
    });
  };
  const handleMarkComplete = () => {
    toast({
      title: "Mark Complete",
      description: "Task completion feature coming soon...",
    });
  };
  const handleScheduleCleaning = () => {
    toast({
      title: "Schedule Cleaning",
      description: "Cleaning schedule feature coming soon...",
    });
  };
  const handleLogBulkPickup = () => {
    toast({
      title: "Log Bulk Pickup",
      description: "Bulk pickup logging feature coming soon...",
    });
  };
  const handleDailyReport = () => {
    toast({
      title: "Daily Report",
      description: "Daily service report feature coming soon...",
    });
  };
  const handleExportData = () => {
    toast({
      title: "Export Data",
      description: "Data export feature coming soon...",
    });
  };
  const handleGPSMap = () => {
    toast({
      title: "GPS Map",
      description: "Live GPS map feature coming soon...",
    });
  };
  const handleServiceHistory = () => {
    toast({
      title: "Service History",
      description: "Customer service history feature coming soon...",
    });
  };
  const handleCustomerNotification = () => {
    toast({
      title: "Customer Notification",
      description: "Customer notification feature coming soon...",
    });
  };
  const handleEmployeeNotification = () => {
    toast({
      title: "Employee Notification",
      description: "Employee notification feature coming soon...",
    });
  };
  const handleMaintenanceMode = () => {
    toast({
      title: "Maintenance Mode",
      description: "Maintenance mode toggle feature coming soon...",
    });
  };
  const handleQuickSearch = () => setShowQuickSearchModal(true);

  const groups: GroupItem[] = [
    {
      id: "customer-management",
      title: "Customer Management",
      icon: Users,
      emoji: "🟢",
      actions: [
        {
          id: "add-customer",
          label: "Add New Customer",
          icon: UserPlus,
          action: handleAddCustomer,
        },
        {
          id: "assign-plan",
          label: "Assign Plan",
          icon: FileText,
          action: handleCreateSubscription,
        },
        {
          id: "edit-customer",
          label: "Edit Customer Details",
          icon: Edit3,
          action: handleEditCustomer,
        },
        {
          id: "add-note",
          label: "Add Note to Customer File",
          icon: FileText,
          action: () => toast({ title: "Add Note", description: "Customer notes feature coming soon..." }),
        },
        {
          id: "suspend-service",
          label: "Suspend / Cancel Service",
          icon: UserX,
          action: handleSuspendService,
          variant: "destructive" as const,
        },
      ],
    },
    {
      id: "billing-payments",
      title: "Billing & Payments",
      icon: CreditCard,
      emoji: "💰",
      actions: [
        {
          id: "create-subscription",
          label: "Create Subscription",
          icon: DollarSign,
          action: handleCreateSubscription,
        },
        {
          id: "upgrade-plan",
          label: "Upgrade/Downgrade Plan",
          icon: TrendingUp,
          action: handleUpgradePlan,
        },
        {
          id: "apply-discount",
          label: "Apply Discount / Promo",
          icon: Percent,
          action: handleApplyDiscount,
        },
        {
          id: "issue-refund",
          label: "Issue Refund / Credit",
          icon: RefreshCw,
          action: handleIssueRefund,
        },
        {
          id: "generate-invoice",
          label: "Generate Invoice / Statement",
          icon: Receipt,
          action: handleGenerateInvoice,
        },
      ],
    },
    {
      id: "service-operations",
      title: "Service Operations",
      icon: Truck,
      emoji: "🚛",
      actions: [
        {
          id: "assign-employee",
          label: "Assign / Reassign Employee",
          icon: UserCheck,
          action: handleAssignEmployee,
        },
        {
          id: "optimize-route",
          label: "Optimize Route",
          icon: Route,
          action: handleOptimizeRoute,
        },
        {
          id: "mark-complete",
          label: "Mark Pickup Complete",
          icon: CheckCircle,
          action: handleMarkComplete,
        },
        {
          id: "schedule-cleaning",
          label: "Schedule Can Cleaning",
          icon: Trash2,
          action: handleScheduleCleaning,
        },
        {
          id: "log-bulk-pickup",
          label: "Log Bulk/Junk Pickup",
          icon: Package,
          action: handleLogBulkPickup,
        },
      ],
    },
    {
      id: "reports-monitoring",
      title: "Reports & Monitoring",
      icon: BarChart3,
      emoji: "📊",
      actions: [
        {
          id: "daily-report",
          label: "View Daily Service Report",
          icon: FileDown,
          action: handleDailyReport,
        },
        {
          id: "export-data",
          label: "Export Data (CSV/XLS)",
          icon: FileDown,
          action: handleExportData,
        },
        {
          id: "gps-map",
          label: "Live Employee GPS Map",
          icon: Map,
          action: handleGPSMap,
        },
        {
          id: "service-history",
          label: "Customer Service History",
          icon: History,
          action: handleServiceHistory,
        },
      ],
    },
    {
      id: "system-tools",
      title: "System Tools",
      icon: Settings,
      emoji: "⚙️",
      actions: [
        {
          id: "customer-notification",
          label: "Send Customer Notification",
          icon: Bell,
          action: handleCustomerNotification,
        },
        {
          id: "employee-notification",
          label: "Send Employee Notification",
          icon: MessageSquare,
          action: handleEmployeeNotification,
        },
        {
          id: "maintenance-mode",
          label: "Toggle Maintenance / Holiday Mode",
          icon: Wrench,
          action: handleMaintenanceMode,
        },
        {
          id: "quick-search",
          label: "Quick Search",
          icon: Search,
          action: handleQuickSearch,
        },
      ],
    },
  ];

  return (
    <>
      <div className="space-y-3">
        {groups.map((group) => {
          const isOpen = openGroups.has(group.id);
          const IconComponent = group.icon;

          return (
            <Card 
              key={group.id} 
              className={cn(
                "transition-all duration-200 hover:shadow-md",
                "border-border bg-card"
              )}
            >
              <Collapsible
                open={isOpen}
                onOpenChange={() => toggleGroup(group.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between p-4 h-auto text-left",
                      "hover:bg-muted/50 transition-colors duration-200",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg" role="img" aria-hidden="true">
                        {group.emoji}
                      </span>
                      <IconComponent className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium text-card-foreground">
                        {group.title}
                      </span>
                    </div>
                    <div className={cn(
                      "transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}>
                      {isOpen ? (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                  <CardContent className="pt-0 pb-4 px-4">
                    <div className="pl-10 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.actions.map((action) => {
                          const ActionIcon = action.icon;
                          return (
                            <Button
                              key={action.id}
                              variant={action.variant || "outline"}
                              size="sm"
                              onClick={action.action}
                              className={cn(
                                "justify-start gap-2 h-9",
                                "hover:scale-[1.02] transition-transform duration-200"
                              )}
                            >
                              <ActionIcon className="h-4 w-4" />
                              <span className="truncate">{action.label}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Modals */}
      <AddCustomerModal 
        open={showAddCustomerModal} 
        onOpenChange={setShowAddCustomerModal}
      />
      
      <EditCustomerModal 
        open={showEditCustomerModal} 
        onOpenChange={setShowEditCustomerModal}
        customerId={selectedCustomerId}
      />
      
      <CreateSubscriptionModal 
        open={showCreateSubscriptionModal} 
        onOpenChange={setShowCreateSubscriptionModal}
      />
      
      <QuickSearchModal 
        open={showQuickSearchModal} 
        onOpenChange={setShowQuickSearchModal}
      />
    </>
  );
}