// Enhanced session management with security monitoring
import { supabase } from '@/integrations/supabase/client';

export interface SessionInfo {
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  isAdmin: boolean;
  securityLevel: 'normal' | 'high' | 'critical';
}

export class SessionManager {
  private static instance: SessionManager;
  private currentSession: SessionInfo | null = null;

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  async initializeSession(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get user info to determine if admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      const isAdmin = profile?.role === 'admin';
      
      // Create session info
      this.currentSession = {
        sessionId: session.access_token.substring(0, 16), // Use part of token as session ID
        ipAddress: await this.getClientIP(),
        userAgent: navigator.userAgent,
        isAdmin,
        securityLevel: isAdmin ? 'high' : 'normal'
      };

      // Log admin session start
      if (isAdmin) {
        await this.logAdminSession('start');
      }

      // Set up session monitoring
      this.startSessionMonitoring();
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      // In production, this would be provided by your server
      // For now, return a placeholder
      return 'client-ip';
    } catch {
      return 'unknown';
    }
  }

  private async logAdminSession(action: 'start' | 'end' | 'activity'): Promise<void> {
    if (!this.currentSession?.isAdmin) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      if (action === 'start') {
        await supabase
          .from('admin_sessions')
          .insert({
            admin_user_id: session.user.id,
            ip_address: this.currentSession.ipAddress,
            user_agent: this.currentSession.userAgent,
            security_level: this.currentSession.securityLevel
          });
      } else if (action === 'activity') {
        await supabase
          .from('admin_sessions')
          .update({ last_activity: new Date().toISOString() })
          .eq('admin_user_id', session.user.id)
          .eq('is_active', true);
      }
    } catch (error) {
      console.error('Failed to log admin session:', error);
    }
  }

  private startSessionMonitoring(): void {
    // Update last activity every 5 minutes
    setInterval(() => {
      if (this.currentSession?.isAdmin) {
        this.logAdminSession('activity');
      }
    }, 5 * 60 * 1000);

    // Monitor for suspicious activity
    this.monitorSuspiciousActivity();
  }

  private monitorSuspiciousActivity(): void {
    // Monitor for multiple tabs/windows
    const handleVisibilityChange = () => {
      if (document.hidden && this.currentSession?.isAdmin) {
        this.logSecurityEvent('admin_session_backgrounded', 'medium');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Monitor for developer tools
    const checkDevTools = () => {
      const threshold = 160;
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (this.currentSession?.isAdmin) {
          this.logSecurityEvent('admin_devtools_detected', 'high');
        }
      }
    };

    setInterval(checkDevTools, 10000);
  }

  private async logSecurityEvent(eventType: string, riskLevel: 'low' | 'medium' | 'high' | 'critical'): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase
        .from('enhanced_security_logs')
        .insert({
          user_id: session.user.id,
          action_type: eventType,
          resource_type: 'session',
          risk_level: riskLevel,
          metadata: {
            session_id: this.currentSession?.sessionId,
            user_agent: this.currentSession?.userAgent,
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  async endSession(): Promise<void> {
    if (this.currentSession?.isAdmin) {
      await this.logAdminSession('end');
      
      // End admin session in database
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase
            .from('admin_sessions')
            .update({ 
              is_active: false, 
              session_end: new Date().toISOString() 
            })
            .eq('admin_user_id', session.user.id)
            .eq('is_active', true);
        }
      } catch (error) {
        console.error('Failed to end admin session:', error);
      }
    }

    this.currentSession = null;
  }

  getCurrentSession(): SessionInfo | null {
    return this.currentSession;
  }

  async validateSessionSecurity(): Promise<boolean> {
    if (!this.currentSession) return false;

    // Check for session hijacking indicators
    const currentUserAgent = navigator.userAgent;
    if (currentUserAgent !== this.currentSession.userAgent) {
      await this.logSecurityEvent('session_hijack_attempt', 'critical');
      return false;
    }

    return true;
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();