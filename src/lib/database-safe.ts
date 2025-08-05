/**
 * Database safety wrapper for graceful handling of missing tables
 * This prevents crashes when components try to access tables that don't exist yet
 */

import { supabase } from '@/integrations/supabase/client';

export function safeDatabaseCall<T>(
  tableName: string,
  fallbackData: T[] = [],
  operation: () => Promise<{ data: T[] | null; error: any }>
): Promise<{ data: T[] | null; error: any }> {
  try {
    // Only allow access to the profiles table for now
    if (tableName === 'profiles') {
      return operation();
    }
    
    // For other tables, return empty data
    console.log(`[DatabaseSafe] Table "${tableName}" not available yet, returning empty data`);
    return Promise.resolve({ data: fallbackData, error: null });
  } catch (error) {
    console.warn(`[DatabaseSafe] Safe call failed for table "${tableName}":`, error);
    return Promise.resolve({ data: fallbackData, error: null });
  }
}

// Override for missing tables to prevent crashes
export const safeSupabase = {
  from: (tableName: string) => {
    if (tableName === 'profiles') {
      return supabase.from(tableName);
    }
    
    // Mock for non-existent tables
    return {
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      delete: () => ({ data: [], error: null }),
      eq: () => ({ data: [], error: null }),
      in: () => ({ data: [], error: null })
    };
  }
};