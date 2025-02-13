
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ibxxacioufdgldfoxwza.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlieHhhY2lvdWZkZ2xkZm94d3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMzU0OTMsImV4cCI6MjA1NDcxMTQ5M30.AUBXEkGC26QJkiHIyOjOZU38Bhzf27X69MtVyIJVpbg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'customer' | 'employee' | 'admin';

export interface UserData {
  id: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}
