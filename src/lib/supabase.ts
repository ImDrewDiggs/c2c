
import { createClient } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'employee' | 'admin';

export interface UserData {
  id: string;
  email?: string;
  role?: UserRole;
  full_name?: string;
  phone?: string;
}

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ibxxacioufdgldfoxwza.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlieHhhY2lvdWZkZ2xkZm94d3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMzU0OTMsImV4cCI6MjA1NDcxMTQ5M30.AUBXEkGC26QJkiHIyOjOZU38Bhzf27X69MtVyIJVpbg';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
