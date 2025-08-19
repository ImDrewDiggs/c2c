import React, { useState } from "react";
import { 
  Users, 
  CreditCard, 
  Truck, 
  BarChart3, 
  Settings,
  Plus,
  Minus
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GroupItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  emoji: string;
  content?: React.ReactNode;
}

const groups: GroupItem[] = [
  {
    id: "customer-management",
    title: "Customer Management",
    icon: Users,
    emoji: "🟢",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Manage customer accounts, profiles, and subscriptions</p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button variant="outline" size="sm" className="justify-start">
            View Customers
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            Add Customer
          </Button>
        </div>
      </div>
    )
  },
  {
    id: "billing-payments",
    title: "Billing & Payments",
    icon: CreditCard,
    emoji: "💰",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Handle invoicing, payments, and billing operations</p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button variant="outline" size="sm" className="justify-start">
            Payment History
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            Create Invoice
          </Button>
        </div>
      </div>
    )
  },
  {
    id: "service-operations",
    title: "Service Operations",
    icon: Truck,
    emoji: "🚛",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Manage routes, schedules, and field operations</p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button variant="outline" size="sm" className="justify-start">
            View Routes
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            Schedule Jobs
          </Button>
        </div>
      </div>
    )
  },
  {
    id: "reports-monitoring",
    title: "Reports & Monitoring",
    icon: BarChart3,
    emoji: "📊",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>Analytics, performance metrics, and business intelligence</p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button variant="outline" size="sm" className="justify-start">
            Analytics
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            Export Reports
          </Button>
        </div>
      </div>
    )
  },
  {
    id: "system-tools",
    title: "System Tools",
    icon: Settings,
    emoji: "⚙️",
    content: (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>System configuration, maintenance, and administrative tools</p>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button variant="outline" size="sm" className="justify-start">
            Settings
          </Button>
          <Button variant="outline" size="sm" className="justify-start">
            Maintenance
          </Button>
        </div>
      </div>
    )
  }
];

export function ExpandableGroups() {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(groupId)) {
      newOpenGroups.delete(groupId);
    } else {
      newOpenGroups.add(groupId);
    }
    setOpenGroups(newOpenGroups);
  };

  return (
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
                  <div className="pl-10">
                    {group.content}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}