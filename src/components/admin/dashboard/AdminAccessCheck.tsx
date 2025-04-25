
import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';

interface AdminAccessCheckProps {
  children: ReactNode;
}

export function AdminAccessCheck({ children }: AdminAccessCheckProps) {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check authentication and admin status
    const checkAccess = async () => {
      try {
        // Simulate authentication check
        const timer = setTimeout(() => {
          // For the purpose of the demo, we'll allow access
          // In a real application, this would check user.role against actual admin roles
          setLoading(false);
        }, 500);
        
        return () => clearTimeout(timer);
      } catch (error) {
        console.error("Error checking admin access:", error);
        navigate('/admin/login');
      }
    };
    
    checkAccess();
  }, [user, isAdmin, isSuperAdmin, navigate]);
  
  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <Card className="p-6 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying admin access...</p>
        </Card>
      </div>
    );
  }
  
  // For demo purposes, we'll always show the children
  // In a real app, you would redirect non-admins away
  return <>{children}</>;
}
