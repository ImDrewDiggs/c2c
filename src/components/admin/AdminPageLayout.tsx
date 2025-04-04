
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { AdminAccessCheck } from "@/components/admin/dashboard/AdminAccessCheck";

interface AdminPageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
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
          {children}
        </Card>
      </div>
    </AdminAccessCheck>
  );
}
