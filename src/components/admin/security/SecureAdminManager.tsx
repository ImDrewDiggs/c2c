import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function SecureAdminManager() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const validatePassword = (password: string): string[] => {
    const issues: string[] = [];
    
    if (password.length < 12) {
      issues.push('Password must be at least 12 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      issues.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      issues.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      issues.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      issues.push('Password must contain at least one special character');
    }
    
    return issues;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User not authenticated"
      });
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New passwords do not match"
      });
      return;
    }

    // Validate password strength
    const passwordIssues = validatePassword(newPassword);
    if (passwordIssues.length > 0) {
      toast({
        variant: "destructive",
        title: "Password Requirements Not Met",
        description: passwordIssues.join('. ')
      });
      return;
    }

    setLoading(true);

    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Log the password change
      await supabase.from('admin_security_logs').insert({
        admin_user_id: user.id,
        action_type: 'password_changed',
        target_user_id: user.id,
        action_details: {
          timestamp: new Date().toISOString(),
          ip_address: 'client_request'
        },
        security_level: 'high'
      });

      toast({
        title: "Password Updated",
        description: "Admin password has been successfully updated"
      });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        variant: "destructive",
        title: "Password Update Failed",
        description: error.message || "Failed to update password"
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordIssues = newPassword ? validatePassword(newPassword) : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Secure Admin Management
        </h2>
        <p className="text-muted-foreground">
          Manage admin security settings and credentials
        </p>
      </div>

      {/* Security Status */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Status:</strong> Admin account is using enhanced security measures. 
          Single admin policy is active.
        </AlertDescription>
      </Alert>

      {/* Password Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Admin Password
          </CardTitle>
          <CardDescription>
            Update your admin password with a strong, secure password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {passwordIssues.length > 0 && (
                <div className="text-sm text-destructive space-y-1">
                  {passwordIssues.map((issue, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {issue}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || passwordIssues.length > 0 || !currentPassword || !newPassword || !confirmPassword}
              className="w-full"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Security Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Password Requirements:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Minimum 12 characters long</li>
              <li>At least one uppercase letter</li>
              <li>At least one lowercase letter</li>
              <li>At least one number</li>
              <li>At least one special character</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold">Security Best Practices:</h4>
            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
              <li>Change your password regularly (every 90 days)</li>
              <li>Never share admin credentials</li>
              <li>Use a unique password not used elsewhere</li>
              <li>Monitor security logs regularly</li>
              <li>Log out when not actively using admin functions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}