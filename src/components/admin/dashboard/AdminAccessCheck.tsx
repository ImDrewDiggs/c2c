
import React, { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";

/**
 * Props interface for AdminAccessCheck component
 */
interface AdminAccessCheckProps {
  children: ReactNode;
}

/**
 * AdminAccessCheck - Component to verify admin access rights
 * 
 * This component ensures only admin users can access protected admin areas.
 * It uses the RequireAuth component to handle verification.
 */
export function AdminAccessCheck({ children }: AdminAccessCheckProps) {
  return (
    <RequireAuth allowedRoles={['admin']} redirectTo="/admin/login">
      {children}
    </RequireAuth>
  );
}
