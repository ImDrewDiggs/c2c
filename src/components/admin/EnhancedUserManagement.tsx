/**
 * Enhanced User Management with RBAC Integration
 * Replaces the old UserManagement with secure database-driven role management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { auditLogger, permissionManager } from '@/utils/securityManager';
import { 
  Users, 
  Shield, 
  UserPlus, 
  RefreshCw, 
  AlertTriangle,
  Eye,
  UserMinus
} from 'lucide-react';

interface UserWithRoles {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  status: string;
  created_at: string;
  user_roles: {
    role: string;
    is_active: boolean;
    expires_at?: string;
  }[];
}

interface SecurityLog {
  id: string;
  action_type: string;
  risk_level: string;
  created_at: string;
  metadata: Record<string, any>;
}

export function EnhancedUserManagement() {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'super_admin'>('admin');

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
      fetchSecurityLogs();
    }
  }, [isSuperAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('secure-admin-management', {
        body: { action: 'list' }
      });

      if (error) throw error;

      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSecurityLogs = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('secure-admin-management', {
        body: { action: 'audit' }
      });

      if (error) throw error;

      setSecurityLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch security logs:', error);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('secure-admin-management', {
        body: {
          action: 'create',
          email: newAdminEmail.trim(),
          role: newAdminRole
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        setCreateAdminOpen(false);
        setNewAdminEmail('');
        setNewAdminRole('admin');
        await fetchUsers();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to create admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user",
        variant: "destructive",
      });
    }
  };

  const handleRevokeAdmin = async (userId: string, role: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Error",
        description: "You cannot revoke your own admin privileges",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('secure-admin-management', {
        body: { 
          action: 'revoke',
          userId, 
          role 
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        await fetchUsers();
        await fetchSecurityLogs();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Failed to revoke admin:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to revoke admin privileges",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'admin': return 'default';
      case 'employee': return 'secondary';
      default: return 'outline';
    }
  };

  const getRiskLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'outline';
    }
  };

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Access Denied
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Super admin privileges required to access user management.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Enhanced User Management
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={fetchUsers} 
                variant="outline" 
                size="sm"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={createAdminOpen} onOpenChange={setCreateAdminOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Admin User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="admin-email">Email Address</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="admin-role">Role</Label>
                      <Select value={newAdminRole} onValueChange={(value: 'admin' | 'super_admin') => setNewAdminRole(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        onClick={() => setCreateAdminOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateAdmin}>
                        Create Admin
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Security Audit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.full_name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{user.id}</div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                          {user.user_roles?.map((userRole, index) => 
                            userRole.is_active && (
                              <Badge 
                                key={index} 
                                variant={getRoleBadgeVariant(userRole.role)}
                                className="text-xs"
                              >
                                {userRole.role}
                                {userRole.expires_at && (
                                  <span className="ml-1 opacity-70">
                                    (expires {new Date(userRole.expires_at).toLocaleDateString()})
                                  </span>
                                )}
                              </Badge>
                            )
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.id !== currentUser?.id && (user.role === 'admin' || user.role === 'super_admin') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeAdmin(user.id, user.role)}
                            className="text-destructive hover:text-destructive"
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Revoke {user.role}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityLogs.slice(0, 50).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{log.action_type}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRiskLevelBadgeVariant(log.risk_level)}>
                          {log.risk_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground max-w-md truncate">
                          {JSON.stringify(log.metadata)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}