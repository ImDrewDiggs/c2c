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
  Map as MapIcon,
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
import { supabase } from "@/integrations/supabase/client";
import { AddCustomerModal } from "../modals/AddCustomerModal";
import { EditCustomerModal } from "../modals/EditCustomerModal";
import { CreateSubscriptionModal } from "../modals/CreateSubscriptionModal";
import { QuickSearchModal } from "../modals/QuickSearchModal";
import { AssignEmployeeModal } from "../modals/AssignEmployeeModal";
import { SendNotificationModal } from "../modals/SendNotificationModal";

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
  const [showAssignEmployeeModal, setShowAssignEmployeeModal] = useState(false);
  const [showSendNotificationModal, setShowSendNotificationModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
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

  const expandAll = () => {
    const allGroupIds = new Set(groups.map(group => group.id));
    setOpenGroups(allGroupIds);
  };

  const collapseAll = () => {
    setOpenGroups(new Set());
  };

  // Action handlers
  const handleAddCustomer = () => setShowAddCustomerModal(true);
  
  const handleEditCustomer = () => {
    // For demo, we'll just open the modal. In real app, you'd select a customer first
    setShowEditCustomerModal(true);
  };

  const handleSuspendService = async () => {
    try {
      // Get the first active subscription to suspend (demo purposes)
      const { data: subscriptions, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("status", "active")
        .limit(1);

      if (error) throw error;

      if (subscriptions && subscriptions.length > 0) {
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({ status: "suspended" })
          .eq("id", subscriptions[0].id);

        if (updateError) throw updateError;

        toast({
          title: "Service Suspended",
          description: "Customer service has been suspended successfully.",
        });
      } else {
        toast({
          title: "No Active Services",
          description: "No active services found to suspend.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to suspend service",
        variant: "destructive",
      });
    }
  };
  const handleCreateSubscription = () => setShowCreateSubscriptionModal(true);
  
  const handleUpgradePlan = async () => {
    try {
      // Get active subscriptions
      const { data: subscriptions, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("status", "active")
        .limit(1);

      if (error) throw error;

      if (subscriptions && subscriptions.length > 0) {
        const currentPrice = Number(subscriptions[0].total_price);
        const upgradedPrice = currentPrice * 1.5; // 50% increase for upgrade

        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({ 
            total_price: upgradedPrice,
            plan_type: "premium" 
          })
          .eq("id", subscriptions[0].id);

        if (updateError) throw updateError;

        toast({
          title: "Plan Upgraded",
          description: `Plan upgraded successfully. New price: $${upgradedPrice.toFixed(2)}`,
        });
      } else {
        toast({
          title: "No Active Plans",
          description: "No active subscription found to upgrade.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upgrade plan",
        variant: "destructive",
      });
    }
  };
  const handleApplyDiscount = async () => {
    try {
      // Apply 20% discount to active subscriptions
      const { data: subscriptions, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("status", "active")
        .limit(5);

      if (error) throw error;

      if (subscriptions && subscriptions.length > 0) {
        for (const sub of subscriptions) {
          const discountedPrice = Number(sub.total_price) * 0.8; // 20% discount
          await supabase
            .from("subscriptions")
            .update({ total_price: discountedPrice })
            .eq("id", sub.id);
        }

        toast({
          title: "Discount Applied",
          description: `20% discount applied to ${subscriptions.length} active subscription(s).`,
        });
      } else {
        toast({
          title: "No Active Subscriptions",
          description: "No active subscriptions found to apply discount.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to apply discount",
        variant: "destructive",
      });
    }
  };

  const handleIssueRefund = async () => {
    try {
      // Create a refund entry in payments table
      const { data: payments, error } = await supabase
        .from("payments")
        .select("*")
        .eq("status", "completed")
        .limit(1);

      if (error) throw error;

      if (payments && payments.length > 0) {
        const refundAmount = Number(payments[0].amount);
        
        const { error: insertError } = await supabase
          .from("payments")
          .insert({
            user_id: payments[0].user_id,
            subscription_id: payments[0].subscription_id,
            amount: -refundAmount, // Negative amount for refund
            payment_method: "refund",
            status: "completed"
          });

        if (insertError) throw insertError;

        toast({
          title: "Refund Issued",
          description: `Refund of $${refundAmount.toFixed(2)} has been processed.`,
        });
      } else {
        toast({
          title: "No Payments Found",
          description: "No completed payments found to refund.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to issue refund",
        variant: "destructive",
      });
    }
  };
  const handleGenerateInvoice = async () => {
    try {
      // Create an order entry for invoice generation
      const { data: subscriptions, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("status", "active")
        .limit(1);

      if (error) throw error;

      if (subscriptions && subscriptions.length > 0) {
        const sub = subscriptions[0];
        const invoiceAmount = Math.round(Number(sub.total_price) * 100); // Convert to cents

        const { error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: sub.user_id,
            subtotal: invoiceAmount,
            total: invoiceAmount,
            status: "pending",
            type: "invoice"
          });

        if (orderError) throw orderError;

        toast({
          title: "Invoice Generated",
          description: `Invoice for $${sub.total_price} has been created.`,
        });
      } else {
        toast({
          title: "No Active Subscriptions",
          description: "No active subscriptions found to generate invoice.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate invoice",
        variant: "destructive",
      });
    }
  };

  const handleAssignEmployee = () => setShowAssignEmployeeModal(true);
  const handleOptimizeRoute = async () => {
    try {
      // Get pending assignments and optimize them
      const { data: assignments, error } = await supabase
        .from("assignments")
        .select(`
          *,
          houses (address, latitude, longitude),
          profiles (full_name)
        `)
        .eq("status", "pending")
        .limit(10);

      if (error) throw error;

      if (assignments && assignments.length > 0) {
        // Simple optimization: assign consecutive jobs to same employee
        const employees = [...new Set(assignments.map(a => a.employee_id))];
        
        for (let i = 0; i < assignments.length; i++) {
          const employeeIndex = i % employees.length;
          await supabase
            .from("assignments")
            .update({ 
              employee_id: employees[employeeIndex],
              status: "assigned"
            })
            .eq("id", assignments[i].id);
        }

        toast({
          title: "Routes Optimized",
          description: `Optimized ${assignments.length} assignments across ${employees.length} employees.`,
        });
      } else {
        toast({
          title: "No Pending Assignments",
          description: "No pending assignments found to optimize.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to optimize routes",
        variant: "destructive",
      });
    }
  };

  const handleMarkComplete = async () => {
    try {
      // Mark oldest pending assignment as completed
      const { data: assignments, error } = await supabase
        .from("assignments")
        .select("*")
        .in("status", ["pending", "assigned"])
        .order("created_at", { ascending: true })
        .limit(1);

      if (error) throw error;

      if (assignments && assignments.length > 0) {
        const { error: updateError } = await supabase
          .from("assignments")
          .update({ 
            status: "completed",
            completed_at: new Date().toISOString()
          })
          .eq("id", assignments[0].id);

        if (updateError) throw updateError;

        toast({
          title: "Pickup Complete",
          description: "Assignment marked as completed successfully.",
        });
      } else {
        toast({
          title: "No Pending Pickups",
          description: "No pending assignments found to complete.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark pickup complete",
        variant: "destructive",
      });
    }
  };
  const handleScheduleCleaning = async () => {
    try {
      // Get a random house and employee for demo
      const { data: houses, error: houseError } = await supabase
        .from("houses")
        .select("*")
        .limit(1);

      // Get employee IDs from user_roles
      const { data: empRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "employee")
        .eq("is_active", true)
        .limit(1);

      const employeeIds = empRoles?.map(r => r.user_id) || [];

      const { data: employees, error: empError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", employeeIds)
        .limit(1);

      if (houseError || empError) throw houseError || empError;

      if (houses && houses.length > 0 && employees && employees.length > 0) {
        const { error: insertError } = await supabase
          .from("assignments")
          .insert({
            house_id: houses[0].id,
            employee_id: employees[0].id,
            status: "scheduled"
          });

        if (insertError) throw insertError;

        toast({
          title: "Cleaning Scheduled",
          description: `Can cleaning scheduled for ${houses[0].address}`,
        });
      } else {
        toast({
          title: "Setup Required",
          description: "Need at least one house and employee to schedule cleaning.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule cleaning",
        variant: "destructive",
      });
    }
  };

  const handleLogBulkPickup = async () => {
    try {
      // Get a house and employee for bulk pickup
      const { data: houses, error: houseError } = await supabase
        .from("houses")
        .select("*")
        .limit(1);

      // Get employee IDs from user_roles
      const { data: empRoles2 } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "employee")
        .eq("is_active", true)
        .limit(1);

      const employeeIds2 = empRoles2?.map(r => r.user_id) || [];

      const { data: employees, error: empError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", employeeIds2)
        .limit(1);

      if (houseError || empError) throw houseError || empError;

      if (houses && houses.length > 0 && employees && employees.length > 0) {
        const { error: insertError } = await supabase
          .from("assignments")
          .insert({
            house_id: houses[0].id,
            employee_id: employees[0].id,
            status: "bulk_pickup"
          });

        if (insertError) throw insertError;

        toast({
          title: "Bulk Pickup Logged",
          description: `Bulk pickup scheduled for ${houses[0].address}`,
        });
      } else {
        toast({
          title: "Setup Required",
          description: "Need at least one house and employee to log bulk pickup.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log bulk pickup",
        variant: "destructive",
      });
    }
  };
  const handleDailyReport = async () => {
    try {
      // Generate a daily report from assignments
      const today = new Date().toISOString().split('T')[0];
      
      const { data: todayAssignments, error } = await supabase
        .from("assignments")
        .select(`
          *,
          houses (address),
          profiles (full_name)
        `)
        .gte("created_at", `${today}T00:00:00.000Z`)
        .lte("created_at", `${today}T23:59:59.999Z`);

      if (error) throw error;

      const completed = todayAssignments?.filter(a => a.status === "completed").length || 0;
      const pending = todayAssignments?.filter(a => a.status === "pending").length || 0;
      const total = todayAssignments?.length || 0;

      toast({
        title: "Daily Report Generated",
        description: `Today: ${total} total assignments, ${completed} completed, ${pending} pending`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate daily report",
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    try {
      // Export customer data as CSV format
      // SECURITY: Role column no longer exists in profiles, fetch from user_roles
      const { data: customers, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, status");

      if (error) throw error;

      // Fetch roles for these users
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("is_active", true)
        .in("user_id", customers?.map(c => c.id) || []);

      const roleMap = new Map<string, string>();
      userRoles?.forEach(ur => {
        roleMap.set(ur.user_id, ur.role);
      });

      if (customers && customers.length > 0) {
        const csvContent = [
          "Name,Email,Phone,Role,Status",
          ...customers.map(c => `${c.full_name},${c.email},${c.phone},${roleMap.get(c.id) || 'customer'},${c.status}`)
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Data Exported",
          description: `Exported ${customers.length} customer records to CSV`,
        });
      } else {
        toast({
          title: "No Data",
          description: "No customer data found to export.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export data",
        variant: "destructive",
      });
    }
  };
  const handleGPSMap = () => {
    // Navigate to live GPS map view
    toast({
      title: "GPS Map",
      description: "Opening live employee GPS tracking map...",
    });
    // In a real app, you'd navigate to a dedicated GPS map page
  };

  const handleServiceHistory = async () => {
    try {
      // Get service history from assignments
      const { data: history, error } = await supabase
        .from("assignments")
        .select(`
          *,
          houses (address),
          profiles (full_name)
        `)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      toast({
        title: "Service History",
        description: `Found ${history?.length || 0} completed service records`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load service history",
        variant: "destructive",
      });
    }
  };

  const handleCustomerNotification = () => setShowSendNotificationModal(true);
  const handleEmployeeNotification = () => setShowSendNotificationModal(true);

  const handleMaintenanceMode = async () => {
    try {
      const newMode = !isMaintenanceMode;
      
      // Update maintenance mode in site settings
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          key: "maintenance_mode",
          value: { enabled: newMode },
          category: "system",
          description: "System maintenance mode toggle"
        }, {
          onConflict: "key"
        });

      if (error) throw error;

      setIsMaintenanceMode(newMode);
      
      toast({
        title: newMode ? "Maintenance Mode ON" : "Maintenance Mode OFF",
        description: newMode 
          ? "System is now in maintenance mode" 
          : "System is back online",
        variant: newMode ? "destructive" : "default",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle maintenance mode",
        variant: "destructive",
      });
    }
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
          action: async () => {
            try {
              // Get customer IDs from user_roles
              const { data: custRoles } = await supabase
                .from("user_roles")
                .select("user_id")
                .eq("role", "customer")
                .eq("is_active", true)
                .limit(1);

              const customerIds = custRoles?.map(r => r.user_id) || [];

              const { data: customers, error } = await supabase
                .from("profiles")
                .select("id, full_name, email")
                .in("id", customerIds)
                .limit(1);

              if (error) throw error;

              if (customers && customers.length > 0) {
                const { error: noteError } = await supabase
                  .from("messages")
                  .insert({
                    sender_id: (await supabase.auth.getUser()).data.user?.id,
                    recipient_id: customers[0].id,
                    subject: "Customer Note",
                    content: "Administrative note added to customer file.",
                    message_type: "note"
                  });

                if (noteError) throw noteError;

                toast({
                  title: "Note Added",
                  description: "Note has been added to customer file.",
                });
              } else {
                toast({
                  title: "No Customers",
                  description: "No customers found to add note.",
                });
              }
            } catch (error: any) {
              toast({
                title: "Error",
                description: error.message || "Failed to add note",
                variant: "destructive",
              });
            }
          },
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
          icon: MapIcon,
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
      {/* Header with expand/collapse controls */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            <Plus className="w-4 h-4 mr-1" />
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            <Minus className="w-4 h-4 mr-1" />
            Collapse All
          </Button>
        </div>
      </div>
      
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
      
      <AssignEmployeeModal 
        open={showAssignEmployeeModal} 
        onOpenChange={setShowAssignEmployeeModal}
      />
      
      <SendNotificationModal 
        open={showSendNotificationModal} 
        onOpenChange={setShowSendNotificationModal}
      />
    </>
  );
}