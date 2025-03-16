
import { Session, User } from '@supabase/supabase-js';
import { UserRole, UserData } from '@/lib/supabase';

export interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  signIn: (email: string, password: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isSuperAdmin: boolean;
}

export interface RouteProtectionOptions {
  publicRoutes: string[];
  roleBasedRoutes: Record<UserRole, string[]>;
  adminEmail: string;
}
