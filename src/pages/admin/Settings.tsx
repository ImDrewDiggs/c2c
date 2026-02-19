import { useState, useEffect } from "react";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Loading from "@/components/ui/Loading";

interface SiteSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  description: string;
}

export default function AdminSettings() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load settings"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('site_settings')
        .update({ value })
        .eq('key', key);

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: "Success",
        description: "Setting updated successfully"
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update setting"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSwitchChange = (key: string, checked: boolean) => {
    updateSetting(key, checked);
  };

  const saveGeneralSettings = async () => {
    try {
      setSaving(true);
      
      const generalKeys = ['company_name', 'contact_email', 'contact_phone', 'business_address'];
      const updates = generalKeys.map(key => 
        supabase
          .from('site_settings')
          .update({ value: settings[key] })
          .eq('key', key)
      );

      await Promise.all(updates);
      
      toast({
        title: "Success",
        description: "General settings saved successfully"
      });
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save general settings"
      });
    } finally {
      setSaving(false);
    }
  };

  const saveAppearanceSettings = async () => {
    try {
      setSaving(true);
      
      const appearanceKeys = ['primary_color', 'secondary_color'];
      const updates = appearanceKeys.map(key => 
        supabase
          .from('site_settings')
          .update({ value: settings[key] })
          .eq('key', key)
      );

      await Promise.all(updates);
      
      toast({
        title: "Success",
        description: "Appearance settings saved successfully"
      });
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save appearance settings"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullscreen={true} message="Loading settings..." />;
  }
  
  return (
    <AdminPageLayout 
      title="Site Settings" 
      description="Configure global site settings"
    >
      <Tabs defaultValue="general">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="iot" className="gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 18.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            IoT Sensors
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details that appear across the system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input 
                    id="company-name" 
                    value={settings.company_name || ''} 
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input 
                    id="contact-email" 
                    type="email" 
                    value={settings.contact_email || ''} 
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Contact Phone</Label>
                  <Input 
                    id="contact-phone" 
                    value={settings.contact_phone || ''} 
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-address">Business Address</Label>
                  <Input 
                    id="business-address" 
                    value={settings.business_address || ''} 
                    onChange={(e) => handleInputChange('business_address', e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={saveGeneralSettings} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide behaviors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-assign">Auto-Assign Pickups</Label>
                    <p className="text-sm text-muted-foreground">Automatically assign pickups to employees based on location and workload.</p>
                  </div>
                  <Switch 
                    id="auto-assign" 
                    checked={settings.auto_assign_pickups || false}
                    onCheckedChange={(checked) => handleSwitchChange('auto_assign_pickups', checked)}
                    disabled={saving}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enable-notifications">Customer Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send automated pickup reminders and service updates to customers.</p>
                  </div>
                  <Switch 
                    id="enable-notifications" 
                    checked={settings.enable_notifications || false}
                    onCheckedChange={(checked) => handleSwitchChange('enable_notifications', checked)}
                    disabled={saving}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Put the system in maintenance mode. Only admins can access the system during this time.</p>
                  </div>
                  <Switch 
                    id="maintenance-mode" 
                    checked={settings.maintenance_mode || false}
                    onCheckedChange={(checked) => handleSwitchChange('maintenance_mode', checked)}
                    disabled={saving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Customize the appearance of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="primary-color" 
                      type="color" 
                      value={settings.primary_color || '#6E59A5'} 
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-16 h-10" 
                    />
                    <Input 
                      value={settings.primary_color || '#6E59A5'} 
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="flex-1" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="secondary-color" 
                      type="color" 
                      value={settings.secondary_color || '#9b87f5'} 
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="w-16 h-10" 
                    />
                    <Input 
                      value={settings.secondary_color || '#9b87f5'} 
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="flex-1" 
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Company Logo</Label>
                <Input id="logo-upload" type="file" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="dark-mode" 
                  checked={settings.enable_dark_mode || false}
                  onCheckedChange={(checked) => handleSwitchChange('enable_dark_mode', checked)}
                  disabled={saving}
                />
                <Label htmlFor="dark-mode">Enable Dark Mode by Default</Label>
              </div>
              <Button onClick={saveAppearanceSettings} disabled={saving}>
                {saving ? "Saving..." : "Save Appearance"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure automated email notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pickup-reminders">Pickup Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send customers a reminder 24 hours before scheduled pickups.</p>
                  </div>
                  <Switch 
                    id="pickup-reminders" 
                    checked={settings.pickup_reminders || false}
                    onCheckedChange={(checked) => handleSwitchChange('pickup_reminders', checked)}
                    disabled={saving}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="employee-assignments">Employee Assignments</Label>
                    <p className="text-sm text-muted-foreground">Notify employees when they are assigned to a new pickup.</p>
                  </div>
                  <Switch 
                    id="employee-assignments" 
                    checked={settings.employee_assignments || false}
                    onCheckedChange={(checked) => handleSwitchChange('employee_assignments', checked)}
                    disabled={saving}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="payment-receipts">Payment Receipts</Label>
                    <p className="text-sm text-muted-foreground">Send receipt emails after successful payments.</p>
                  </div>
                  <Switch 
                    id="payment-receipts" 
                    checked={settings.payment_receipts || false}
                    onCheckedChange={(checked) => handleSwitchChange('payment_receipts', checked)}
                    disabled={saving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security options for the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require admin users to verify their identity with a second factor.</p>
                  </div>
                  <Switch 
                    id="two-factor" 
                    checked={settings.two_factor_auth || false}
                    onCheckedChange={(checked) => handleSwitchChange('two_factor_auth', checked)}
                    disabled={saving}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="session-timeout">Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Automatically log users out after a period of inactivity.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input 
                      id="session-timeout" 
                      type="number" 
                      value={settings.session_timeout || 30} 
                      onChange={(e) => handleInputChange('session_timeout', e.target.value)}
                      className="w-20" 
                    />
                    <span className="text-sm text-muted-foreground">minutes</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateSetting('session_timeout', parseInt(settings.session_timeout) || 30)}
                      disabled={saving}
                    >
                      Save
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="password-policy">Password Policy</Label>
                    <p className="text-sm text-muted-foreground">Enforce strong password requirements.</p>
                  </div>
                  <Switch 
                    id="password-policy" 
                    checked={settings.password_policy || false}
                    onCheckedChange={(checked) => handleSwitchChange('password_policy', checked)}
                    disabled={saving}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage API keys for third-party integrations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">Current API Key</Label>
                  <div className="flex gap-2">
                    <Input id="api-key" value={settings.api_key || 'sk_live_xxxxxxxxxxxxxxxxxxx'} readOnly className="flex-1" />
                    <Button 
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(settings.api_key || 'sk_live_xxxxxxxxxxxxxxxxxxx');
                        toast({ title: "Copied", description: "API key copied to clipboard" });
                      }}
                    >
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-destructive"
                      onClick={() => {
                        if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
                          updateSetting('api_key', '');
                          toast({ title: "Revoked", description: "API key has been revoked" });
                        }
                      }}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    const newKey = `sk_live_${crypto.randomUUID().replace(/-/g, '')}`;
                    updateSetting('api_key', newKey);
                    toast({ title: "Generated", description: "New API key has been generated" });
                  }}
                  disabled={saving}
                >
                  Generate New API Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="iot" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>IoT Sensor Management</CardTitle>
              <CardDescription>Add, monitor, and manage IoT sensors connected to your operations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Manage all your IoT sensors from the dedicated dashboard. Add sensors, configure alert thresholds, 
                view real-time data, and monitor historical readings.
              </p>
              <Button onClick={() => window.location.href = '/admin/iot-sensors'}>
                Open IoT Sensor Dashboard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageLayout>
  );
}