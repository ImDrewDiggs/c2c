
import { createClient } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'employee' | 'admin';

export interface UserData {
  id: string;
  email?: string;
  role?: UserRole;
  full_name?: string;
  phone?: string;
}

// Initialize Supabase client with the correct API key
// Use the key from integrations/supabase/client.ts which has the latest key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ibxxacioufdgldfoxwza.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlieHhhY2lvdWZkZ2xkZm94d3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3NzAwNDIsImV4cCI6MjA1NTM0NjA0Mn0.XPMh_xzCZIN39srb9QF2k8DW3MUqjuQfYLz31DoDzXI';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  }
});
