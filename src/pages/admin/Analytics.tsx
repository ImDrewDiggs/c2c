
import { useState, useEffect } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";

function AnalyticsContent() {
  const [isLoading, setIsLoading] = useState(true);
  
  // Add a small delay to ensure data is properly loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Increased from 500ms to 1000ms for more reliability
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading analytics data...</span>
      </div>
    );
  }
  
  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="revenue">Revenue</TabsTrigger>
        <TabsTrigger value="operations">Operations</TabsTrigger>
        <TabsTrigger value="customers">Customers</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6">
        <ErrorBoundary
          fallback={
            <Card className="p-6 text-center text-muted-foreground">
              There was an error loading analytics data.
            </Card>
          }
        >
          <AnalyticsDashboard />
        </ErrorBoundary>
      </TabsContent>
      
      <TabsContent value="revenue" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Detailed analysis of company revenue streams</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 text-center text-muted-foreground">
              Revenue analytics visualization would appear here.
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="operations" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Operations Analytics</CardTitle>
            <CardDescription>Efficiency metrics and optimization opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 text-center text-muted-foreground">
              Operations analytics visualization would appear here.
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="customers" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Analytics</CardTitle>
            <CardDescription>Customer acquisition, retention, and behavior data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 text-center text-muted-foreground">
              Customer analytics visualization would appear here.
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default function AdminAnalytics() {
  return (
    <AdminPageLayout 
      title="Advanced Analytics" 
      description="In-depth business analytics"
    >
      <ErrorBoundary
        fallback={
          <div className="p-6 text-center text-muted-foreground">
            There was an error loading the analytics page.
          </div>
        }
      >
        <AnalyticsContent />
      </ErrorBoundary>
    </AdminPageLayout>
  );
}
