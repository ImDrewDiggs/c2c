
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeLocation } from "@/types/map";
import { Badge } from "@/components/ui/badge";
import { User, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface EmployeeStatusPanelProps {
  employees: EmployeeLocation[];
}

export function EmployeeStatusPanel({ employees }: EmployeeStatusPanelProps) {
  const [employeeProfiles, setEmployeeProfiles] = useState<Record<string, any>>({});

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
      
      const profileMap = data.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});
      
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
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">
                        {profile?.full_name || profile?.email || `Employee ${employee.employee_id.substring(0, 8)}`}
                      </p>
                      <Badge variant={employee.is_online ? "success" : "secondary"}>
                        {employee.is_online ? "Online" : "Offline"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last seen: {lastSeen}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
