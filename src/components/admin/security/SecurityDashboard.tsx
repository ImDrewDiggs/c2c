import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Clock, User, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityLog {
  id: string;
  admin_user_id: string;
  action_type: string;
  target_user_id: string;
  action_details: any;
  security_level: string;
  created_at: string;
}

interface SecurityStats {
  totalLogs: number;
  criticalAlerts: number;
  recentAdminActions: number;
  lastAdminLogin: string;
}

export function SecurityDashboard() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [stats, setStats] = useState<SecurityStats>({
    totalLogs: 0,
    criticalAlerts: 0,
    recentAdminActions: 0,
    lastAdminLogin: 'Never'
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      
      // Fetch recent security logs
      const { data: logsData, error: logsError } = await supabase
        .from('admin_security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      setLogs(logsData || []);

      // Calculate stats
      const totalLogs = logsData?.length || 0;
      const criticalAlerts = logsData?.filter(log => log.security_level === 'critical').length || 0;
      const recentActions = logsData?.filter(log => {
        const logDate = new Date(log.created_at);
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return logDate > dayAgo;
      }).length || 0;

      setStats({
        totalLogs,
        criticalAlerts,
        recentAdminActions: recentActions,
        lastAdminLogin: logsData?.[0]?.created_at ? new Date(logsData[0].created_at).toLocaleString() : 'Never'
      });

    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load security data"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSecurityLevelBadge = (level: string) => {
    const variants: Record<string, any> = {
      low: { variant: 'secondary', icon: '🟢' },
      medium: { variant: 'default', icon: '🟡' },
      high: { variant: 'destructive', icon: '🟠' },
      critical: { variant: 'destructive', icon: '🔴' }
    };

    const config = variants[level] || variants.medium;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <span>{config.icon}</span>
        {level.toUpperCase()}
      </Badge>
    );
  };

  const formatActionType = (actionType: string) => {
    return actionType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">Loading security dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security Dashboard
          </h2>
          <p className="text-muted-foreground">
            Monitor and review security events and admin activities
          </p>
        </div>
        <Button onClick={loadSecurityData} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Security Logs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.criticalAlerts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Actions (24h)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentAdminActions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Admin Activity</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{stats.lastAdminLogin}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>
            Latest security logs and admin activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No security logs found</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">
                        {formatActionType(log.action_type)}
                      </span>
                      {getSecurityLevelBadge(log.security_level)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Target: {log.target_user_id}</p>
                      {log.action_details && (
                        <p>Details: {JSON.stringify(log.action_details)}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}