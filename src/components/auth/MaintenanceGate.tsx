import React, { PropsWithChildren } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSetting } from '@/hooks/use-site-setting';
import MaintenancePage from '@/pages/Maintenance';

/**
 * MaintenanceGate
 * Blocks access for non-admin users when maintenance_mode is enabled in site_settings.
 * Admins retain full access. Admin login route remains accessible for everyone.
 */
export default function MaintenanceGate({ children }: PropsWithChildren) {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const { value: maintenanceEnabled, loading } = useSiteSetting<boolean>('maintenance_mode', false);

  // Allow admin login route so admins can sign in during maintenance
  const isAdminLogin = location.pathname.startsWith('/admin/login');

  if (loading) return <>{children}</>; // don't block while checking

  if (maintenanceEnabled && !isAdmin && !isAdminLogin) {
    // If user tries to access dashboards, let them see maintenance page rather than redirect loops
    if (location.pathname !== '/maintenance') {
      return <MaintenancePage />;
    }
    return <MaintenancePage />;
  }

  // If user navigates to /maintenance but gate is off or user is admin, redirect home
  if (!maintenanceEnabled && location.pathname === '/maintenance') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
