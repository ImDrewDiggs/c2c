
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ibxxacioufdgldfoxwza.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlieHhhY2lvdWZkZ2xkZm94d3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3NzAwNDIsImV4cCI6MjA1NTM0NjA0Mn0.XPMh_xzCZIN39srb9QF2k8DW3MUqjuQfYLz31DoDzXI";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

