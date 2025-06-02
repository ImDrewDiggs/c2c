
import { createClient } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'employee' | 'admin';

export interface UserData {
  id: string;
  email?: string;
  role?: UserRole;
  full_name?: string;
  phone?: string;
}

// Use the correct Supabase URL and key from the integrations client
const supabaseUrl = 'https://pofidqkzmqxbskazxmnu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvZmlkcWt6bXF4YnNrYXp4bW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2NTQxNzYsImV4cCI6MjA2NDIzMDE3Nn0.EMNQs_YRQN6CpXQBzZh3fLWaPRrhm7paRgVV_4MrxQQ';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  }
});
