
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReactNode } from "react";

/**
 * Props interface for DashboardTabs component
 * Defines the content for each tab section
 */
interface DashboardTabsProps {
  operationsContent: ReactNode; // Content for operations tab
  employeesContent: ReactNode;  // Content for employees tab
  analyticsContent: ReactNode;  // Content for analytics tab
  usersContent: ReactNode;      // Content for users management tab
}

/**
 * DashboardTabs - Tabbed interface for the admin dashboard
 * 
 * Provides a tabbed navigation system to switch between different
 * dashboard views: Operations, Employees, Analytics, and Users.
 */
export function DashboardTabs({
  operationsContent,
  employeesContent,
  analyticsContent,
  usersContent,
}: DashboardTabsProps) {
  return (
    <Tabs defaultValue="operations" className="space-y-6">
      {/* Tab navigation buttons */}
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="operations">Operations</TabsTrigger>
        <TabsTrigger value="employees">Employees</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="users">Users</TabsTrigger>
      </TabsList>
      
      {/* Tab content panels */}
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
