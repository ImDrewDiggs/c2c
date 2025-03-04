
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  Settings, 
  DollarSign, 
  FileText, 
  Clock, 
  Calendar, 
  Building, 
  Trash2,
  User
} from "lucide-react";
import { Link } from "react-router-dom";

interface QuickLinksProps {
  superAdmin: boolean;
}

export function QuickLinks({ superAdmin }: QuickLinksProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/admin/employees">
          <Button variant="outline" className="w-full h-20 flex flex-col gap-1">
            <Users className="h-5 w-5" />
            <span>Manage Employees</span>
          </Button>
        </Link>
        
        <Link to="/admin/customers">
          <Button variant="outline" className="w-full h-20 flex flex-col gap-1">
            <User className="h-5 w-5" />
            <span>Manage Customers</span>
          </Button>
        </Link>
        
        <Link to="/admin/pricing">
          <Button variant="outline" className="w-full h-20 flex flex-col gap-1">
            <DollarSign className="h-5 w-5" />
            <span>Update Pricing</span>
          </Button>
        </Link>
        
        <Link to="/admin/schedules">
          <Button variant="outline" className="w-full h-20 flex flex-col gap-1">
            <Calendar className="h-5 w-5" />
            <span>Schedules</span>
          </Button>
        </Link>

        {superAdmin && (
          <>
            <Link to="/admin/settings">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-1">
                <Settings className="h-5 w-5" />
                <span>Site Settings</span>
              </Button>
            </Link>
            
            <Link to="/admin/reports">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-1">
                <FileText className="h-5 w-5" />
                <span>Reports</span>
              </Button>
            </Link>
            
            <Link to="/admin/properties">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-1">
                <Building className="h-5 w-5" />
                <span>Properties</span>
              </Button>
            </Link>
            
            <Link to="/admin/service-logs">
              <Button variant="outline" className="w-full h-20 flex flex-col gap-1">
                <Trash2 className="h-5 w-5" />
                <span>Service Logs</span>
              </Button>
            </Link>
          </>
        )}
      </div>
    </Card>
  );
}
