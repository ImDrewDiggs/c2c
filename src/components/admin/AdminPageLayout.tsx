
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { AdminAccessCheck } from "@/components/admin/dashboard/AdminAccessCheck";
import { ErrorBoundary } from "react-error-boundary";

interface AdminPageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-md">
      <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong:</h2>
      <pre className="text-sm bg-white p-3 rounded border border-red-100 overflow-auto">
        {error.message}
      </pre>
      <Button 
        className="mt-4" 
        variant="outline" 
        onClick={() => window.location.reload()}
      >
        Try again
      </Button>
    </div>
  );
}

export function AdminPageLayout({ children, title, description }: AdminPageLayoutProps) {
  const location = useLocation();
  
  return (
    <AdminAccessCheck>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            asChild
          >
            <Link to="/admin/dashboard">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
        </div>
        
        <Card className="p-6">
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            {children}
          </ErrorBoundary>
        </Card>
      </div>
    </AdminAccessCheck>
  );
}
