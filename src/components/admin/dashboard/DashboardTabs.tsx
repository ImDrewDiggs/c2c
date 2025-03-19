
import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DashboardTabsProps {
  operationsContent: ReactNode;
  employeesContent: ReactNode;
  analyticsContent: ReactNode;
  usersContent: ReactNode;
}

export function DashboardTabs({ 
  operationsContent, 
  employeesContent, 
  analyticsContent, 
  usersContent 
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="operations" className="space-y-6">
      <TabsList className="grid grid-cols-4 w-full md:w-auto">
        <TabsTrigger value="operations">Operations</TabsTrigger>
        <TabsTrigger value="employees">Employee Tracker</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="users">User Management</TabsTrigger>
      </TabsList>

      <TabsContent value="operations" className="space-y-6">
        {operationsContent}
      </TabsContent>

      <TabsContent value="employees">
        {employeesContent}
      </TabsContent>

      <TabsContent value="analytics">
        {analyticsContent}
      </TabsContent>

      <TabsContent value="users">
        {usersContent}
      </TabsContent>
    </Tabs>
  );
}
