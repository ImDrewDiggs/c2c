
import { Database } from '@/integrations/supabase/types';

// Database row types
export type HouseRow = Database['public']['Tables']['houses']['Row'];
export type AssignmentRow = Database['public']['Tables']['assignments']['Row'];
export type EmployeeLocationRow = Database['public']['Tables']['employee_locations']['Row'];
export type AppointmentRow = Database['public']['Tables']['appointments']['Row'];

// Type-safe helper for Supabase function return types
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;
