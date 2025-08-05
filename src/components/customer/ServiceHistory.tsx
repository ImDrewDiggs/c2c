import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ServiceHistoryProps {
  userId: string;
}

const ServiceHistory = ({ userId }: ServiceHistoryProps) => {
  // Temporarily disabled until all subscription tables are created
  const serviceHistory = [];
  const isLoading = false;
  const error = null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error loading service history. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service History Coming Soon</CardTitle>
          <CardDescription>Service tracking will be available once all database tables are set up.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Database tables are being created for the service tracking system.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceHistory;