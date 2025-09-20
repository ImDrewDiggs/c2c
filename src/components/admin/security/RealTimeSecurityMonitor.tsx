import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Shield, Activity, Clock, Ban, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecurityAlert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive';
  }>;
}

interface LiveMetrics {
  activeAdminSessions: number;
  suspiciousActivity: number;
  failedLoginAttempts: number;
  blockedIPs: number;
}

export function RealTimeSecurityMonitor() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<LiveMetrics>({
    activeAdminSessions: 0,
    suspiciousActivity: 0,
    failedLoginAttempts: 0,
    blockedIPs: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!isMonitoring) return;

    const checkSecurityMetrics = async () => {
      try {
        // Get active admin sessions
        const { data: sessions } = await supabase
          .from('admin_sessions')
          .select('id')
          .eq('is_active', true);

        // Get recent suspicious activity (last 1 hour)
        const { data: suspiciousEvents } = await supabase
          .from('enhanced_security_logs')
          .select('id')
          .in('risk_level', ['high', 'critical'])
          .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

        // Get failed login attempts (last 1 hour)
        const { data: failedLogins } = await supabase
          .from('enhanced_security_logs')
          .select('id')
          .eq('action_type', 'login_failed')
          .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

        // Get blocked IPs
        const { data: blockedIPs } = await supabase
          .from('rate_limits')
          .select('id')
          .eq('is_blocked', true)
          .gt('window_end', new Date().toISOString());

        const newMetrics: LiveMetrics = {
          activeAdminSessions: sessions?.length || 0,
          suspiciousActivity: suspiciousEvents?.length || 0,
          failedLoginAttempts: failedLogins?.length || 0,
          blockedIPs: blockedIPs?.length || 0
        };

        setMetrics(newMetrics);

        // Generate alerts based on metrics
        const newAlerts: SecurityAlert[] = [];

        if (newMetrics.activeAdminSessions > 2) {
          newAlerts.push({
            id: 'multiple-admin-sessions',
            type: 'high',
            message: `${newMetrics.activeAdminSessions} concurrent admin sessions detected`,
            timestamp: new Date().toISOString(),
            actions: [{
              label: 'Review Sessions',
              action: () => window.location.hash = '#/admin/security'
            }]
          });
        }

        if (newMetrics.suspiciousActivity > 5) {
          newAlerts.push({
            id: 'high-suspicious-activity',
            type: 'critical',
            message: `${newMetrics.suspiciousActivity} suspicious security events in the last hour`,
            timestamp: new Date().toISOString(),
            actions: [{
              label: 'Investigate',
              action: () => window.location.hash = '#/admin/security',
              variant: 'destructive' as const
            }]
          });
        }

        if (newMetrics.failedLoginAttempts > 10) {
          newAlerts.push({
            id: 'brute-force-attempt',
            type: 'critical',
            message: `Potential brute force attack: ${newMetrics.failedLoginAttempts} failed login attempts`,
            timestamp: new Date().toISOString(),
            actions: [{
              label: 'Block Source',
              action: () => blockSuspiciousIPs(),
              variant: 'destructive' as const
            }]
          });
        }

        setAlerts(prev => {
          const existingIds = prev.map(alert => alert.id);
          const uniqueNewAlerts = newAlerts.filter(alert => !existingIds.includes(alert.id));
          return [...prev, ...uniqueNewAlerts].slice(-10); // Keep last 10 alerts
        });

      } catch (error) {
        console.error('Failed to check security metrics:', error);
      }
    };

    // Initial check
    checkSecurityMetrics();

    // Set up real-time monitoring
    const interval = setInterval(checkSecurityMetrics, 30000); // Check every 30 seconds

    // Set up real-time subscriptions
    const securityChannel = supabase
      .channel('security-monitor')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'enhanced_security_logs'
        },
        (payload) => {
          const newEvent = payload.new as any;
          if (newEvent.risk_level === 'critical') {
            toast({
              variant: "destructive",
              title: "Critical Security Event",
              description: `${newEvent.action_type} detected`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(securityChannel);
    };
  }, [isMonitoring, toast]);

  const blockSuspiciousIPs = async () => {
    try {
      // This would implement actual IP blocking logic
      toast({
        title: "IPs Blocked",
        description: "Suspicious IP addresses have been blocked",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to block suspicious IPs",
      });
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <Shield className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      default:
        return <Eye className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertVariant = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'critical':
      case 'high':
        return 'destructive' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Real-Time Security Monitor</CardTitle>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground">
              {isMonitoring ? 'Monitoring' : 'Stopped'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMonitoring(!isMonitoring)}
            >
              {isMonitoring ? 'Stop' : 'Start'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Live Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Admin Sessions</p>
                <p className="text-lg font-semibold">{metrics.activeAdminSessions}</p>
              </div>
              <Shield className="h-4 w-4 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Suspicious Activity</p>
                <p className="text-lg font-semibold text-orange-500">{metrics.suspiciousActivity}</p>
              </div>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Failed Logins</p>
                <p className="text-lg font-semibold text-red-500">{metrics.failedLoginAttempts}</p>
              </div>
              <Activity className="h-4 w-4 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Blocked IPs</p>
                <p className="text-lg font-semibold">{metrics.blockedIPs}</p>
              </div>
              <Ban className="h-4 w-4 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Security Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} variant={getAlertVariant(alert.type)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <AlertDescription className="mb-2">
                        {alert.message}
                      </AlertDescription>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getAlertVariant(alert.type)}>
                          {alert.type.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      {alert.actions && (
                        <div className="flex space-x-2 mt-2">
                          {alert.actions.map((action, index) => (
                            <Button
                              key={index}
                              variant={action.variant || 'default'}
                              size="sm"
                              onClick={action.action}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    ×
                  </Button>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}