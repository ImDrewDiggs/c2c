
import { supabase as supabaseClient } from '@/integrations/supabase/client';

export const supabase = supabaseClient;

export type UserRole = 'customer' | 'employee' | 'admin';

export interface UserData {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}
