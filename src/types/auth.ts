
import { User } from "@supabase/supabase-js";
import { UserData, UserRole } from "@/lib/supabase";

export interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  signIn: (email: string, password: string, role: UserRole) => Promise<string | void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean; // Adding the missing property
  ADMIN_EMAIL?: string;
}

export interface RouteProtectionOptions {
  publicRoutes: string[];
  roleBasedRoutes: Record<UserRole, string[]>;
  adminEmail: string;
}
