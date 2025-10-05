import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  RefreshCw, 
  UserPlus,
  Shield,
  User
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'employee' | 'admin';
  created_at: string;
  phone?: string;
}

// Update the component to not take props since we'll use useAuth directly
export function UserManagement() {
  const [employees, setEmployees] = useState<UserData[]>([]);
  const [customers, setCustomers] = useState<UserData[]>([]);
  const [admins, setAdmins] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const { isSuperAdmin } = useAuth();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // SECURITY: Roles are now in user_roles table, not profiles
      // We fetch all profiles and then filter by their roles from user_roles
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone, address, job_title, status, created_at, updated_at');
      
      if (profilesError) throw profilesError;

      // Fetch user roles separately
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('is_active', true);
      
      if (rolesError) throw rolesError;

      // Create a map of user_id to role with explicit typing
      const roleMap = new Map<string, string>();
      userRoles?.forEach(ur => roleMap.set(ur.user_id, ur.role));

      // Categorize users by their roles
      const employees: UserData[] = [];
      const customers: UserData[] = [];
      const admins: UserData[] = [];

      allProfiles?.forEach(profile => {
        const role = roleMap.get(profile.id) || 'customer';
        const userData = { ...profile, role } as UserData;
        
        if (role === 'employee') {
          employees.push(userData);
        } else if (role === 'customer') {
          customers.push(userData);
        } else if (role === 'admin' || role === 'super_admin') {
          if (isSuperAdmin) {
            admins.push(userData);
          }
        }
      });
      
      setEmployees(employees);
      setCustomers(customers);
      setAdmins(admins);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load users",
        description: error.message,
      });
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isSuperAdmin, toast]);

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleEdit = (userId: string, userType: 'employee' | 'customer' | 'admin') => {
    // Navigate to user edit page or open edit modal
    toast({
      title: "Edit User",
      description: `Editing ${userType} with ID: ${userId}`,
    });
  };

  const handleDelete = async (userId: string, userType: 'employee' | 'customer' | 'admin') => {
    if (confirm(`Are you sure you want to delete this ${userType}? This action cannot be undone.`)) {
      try {
        const { data, error } = await supabase.functions.invoke('admin-delete-user', {
          body: { userId }
        });

        if (error) throw error;

        toast({
          title: "User Deleted",
          description: `The ${userType} has been deleted successfully.`,
        });

        // Refresh user lists
        fetchUsers();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: error.message || 'Failed to delete user',
        });
      }
    }
  };

  const UserTable = ({ users, userType }: { users: UserData[], userType: 'employee' | 'customer' | 'admin' }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.phone || 'N/A'}</TableCell>
            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEdit(user.id, userType)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                {isSuperAdmin && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(user.id, userType)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
        {users.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4 text-gray-500">
              No {userType}s found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">User Management</h3>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {isSuperAdmin && (
              <Button size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add User
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="employees" className="space-y-4">
          <TabsList>
            <TabsTrigger value="employees" className="flex items-center">
              <UserPlus className="h-4 w-4 mr-2" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Customers
            </TabsTrigger>
            {isSuperAdmin && (
              <TabsTrigger value="admins" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Admins
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="employees">
            <UserTable users={employees} userType="employee" />
          </TabsContent>

          <TabsContent value="customers">
            <UserTable users={customers} userType="customer" />
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="admins">
              <UserTable users={admins} userType="admin" />
            </TabsContent>
          )}
        </Tabs>
      </Card>
    </div>
  );
}
