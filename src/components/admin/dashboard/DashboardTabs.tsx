
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

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
  usersContent,
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="operations" className="space-y-6">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="operations">Operations</TabsTrigger>
        <TabsTrigger value="employees">Employees</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
      </TabsList>
      
      <TabsContent value="operations" className="space-y-6">
        {operationsContent}
      </TabsContent>
      
      <TabsContent value="employees" className="space-y-6">
        {employeesContent}
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-6">
        {analyticsContent}
      </TabsContent>
      
      <TabsContent value="users" className="space-y-6">
        {usersContent}
      </TabsContent>
    </Tabs>
  );
}
