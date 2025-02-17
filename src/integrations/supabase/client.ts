
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ibxxacioufdgldfoxwza.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlieHhhY2lvdWZkZ2xkZm94d3phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkxMzU0OTMsImV4cCI6MjA1NDcxMTQ5M30.AUBXEkGC26QJkiHIyOjOZU38Bhzf27X69MtVyIJVpbg";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
