
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeLocation } from "@/types/map";
import { Badge } from "@/components/ui/badge";
import { User, Circle, MoreVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface EmployeeStatusPanelProps {
  employees: EmployeeLocation[];
}

export function EmployeeStatusPanel({ employees }: EmployeeStatusPanelProps) {
  const [employeeProfiles, setEmployeeProfiles] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployeeProfiles = async () => {
      if (employees.length === 0) return;
      const employeeIds = employees.map(e => e.employee_id);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', employeeIds);
      if (error) {
        console.error('Error fetching employee profiles:', error);
        return;
      }
      const profileMap = (data || []).reduce((acc: Record<string, any>, profile: any) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);
      setEmployeeProfiles(profileMap);
    };
    fetchEmployeeProfiles();
  }, [employees]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <User className="h-5 w-5 mr-2" />
          Employee Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <p className="text-muted-foreground text-sm">No employees found</p>
        ) : (
          <div className="max-h-[300px] overflow-y-auto space-y-3">
            {employees.map((employee) => {
              const profile = employeeProfiles[employee.employee_id];
              const lastSeen = new Date(employee.last_seen_at).toLocaleString();
              
              return (
                <div key={employee.employee_id} className="flex items-center p-2 rounded-md hover:bg-muted">
                  <div className="mr-2">
                    {employee.is_online ? (
                      <Circle className="h-3 w-3 fill-green-500 text-green-500" />
                    ) : (
                      <Circle className="h-3 w-3 fill-gray-300 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <div className="flex justify-between items-center gap-2">
                      <p className="text-sm font-medium">
                        {profile?.full_name || profile?.email || 'Unknown Employee'}
                      </p>
                      <Badge variant={employee.is_online ? "default" : "secondary"}>
                        {employee.is_online ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last seen: {lastSeen}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="More actions">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/admin/employees?edit=${employee.employee_id}`)}>
                        Modify User
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={async () => {
                          if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
                          try {
                            const { error } = await supabase.functions.invoke('admin-delete-user', { body: { userId: employee.employee_id } });
                            if (error) throw error;
                            toast({ title: 'User Deleted', description: 'The user has been removed.' });
                          } catch (err: any) {
                            toast({ variant: 'destructive', title: 'Delete failed', description: err.message || 'Could not delete user' });
                          }
                        }}
                      >
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
