import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Shield, Users, Activity, Clock, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  user_id: string;
  action_type: string;
  resource_type: string;
  risk_level: string;
  created_at: string;
  metadata: any;
}

interface AdminSession {
  id: string;
  admin_user_id: string;
  session_start: string;
  session_end?: string;
  ip_address: string | null;
  is_active: boolean;
  last_activity: string;
  security_level: string;
}

interface RateLimit {
  id: string;
  identifier: string;
  action_type: string;
  attempt_count: number;
  is_blocked: boolean;
  window_end: string;
}

export function SecurityMonitoringDashboard() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [adminSessions, setAdminSessions] = useState<AdminSession[]>([]);
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSecurityData = async () => {
    try {
      // Fetch recent security events
      const { data: events } = await supabase
        .from('enhanced_security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch active admin sessions
      const { data: sessions } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      // Fetch current rate limits
      const { data: limits } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('is_blocked', true)
        .order('window_end', { ascending: true });

      setSecurityEvents((events || []) as SecurityEvent[]);
      setAdminSessions((sessions || []) as AdminSession[]);
      setRateLimits((limits || []) as RateLimit[]);
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const emergencyDisableAdmin = async (adminId: string) => {
    try {
      const { data, error } = await supabase.rpc('emergency_disable_admin', {
        target_admin_id: adminId
      });

      if (error) throw error;

      if ((data as any)?.success) {
        toast({
          title: 'Admin Disabled',
          description: 'Admin account has been emergency disabled.',
          variant: 'destructive'
        });
        fetchSecurityData();
      } else {
        throw new Error((data as any)?.message || 'Failed to disable admin');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSecurityLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high': return <Shield className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Activity className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading security data...</div>;
  }

  const criticalEvents = securityEvents.filter(e => e.risk_level === 'critical').length;
  const activeSessions = adminSessions.length;
  const blockedIPs = rateLimits.length;

  return (
    <div className="space-y-6">
      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events (24h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{criticalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Admin Sessions</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{activeSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Ban className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{blockedIPs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {criticalEvents > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {criticalEvents} critical security events detected in the last 24 hours. Review immediately.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="sessions">Admin Sessions</TabsTrigger>
          <TabsTrigger value="threats">Rate Limits & Threats</TabsTrigger>
        </TabsList>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>Real-time security event monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getSecurityLevelIcon(event.risk_level)}
                      <div>
                        <div className="font-medium">{event.action_type}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.resource_type} • {new Date(event.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getRiskBadgeColor(event.risk_level)}>
                      {event.risk_level}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Active Admin Sessions</CardTitle>
              <CardDescription>Monitor and manage administrator sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-medium">Admin Session</div>
                        <div className="text-sm text-muted-foreground">
                          IP: {session.ip_address || 'Unknown'} • Started: {new Date(session.session_start).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last activity: {new Date(session.last_activity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={session.security_level === 'high' ? 'destructive' : 'default'}>
                        {session.security_level}
                      </Badge>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => emergencyDisableAdmin(session.admin_user_id)}
                      >
                        Emergency Disable
                      </Button>
                    </div>
                  </div>
                ))}
                {adminSessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active admin sessions
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limits & Threats</CardTitle>
              <CardDescription>Active rate limits and blocked entities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rateLimits.map((limit) => (
                  <div key={limit.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Ban className="h-4 w-4 text-red-500" />
                      <div>
                        <div className="font-medium">{limit.action_type}</div>
                        <div className="text-sm text-muted-foreground">
                          {limit.identifier} • {limit.attempt_count} attempts
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Blocked until: {new Date(limit.window_end).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant="destructive">Blocked</Badge>
                  </div>
                ))}
                {rateLimits.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active rate limits
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}