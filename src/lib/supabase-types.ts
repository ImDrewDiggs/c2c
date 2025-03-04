
import { Database } from '@/integrations/supabase/types';
import { Json } from '@/integrations/supabase/types';

// Database row types from the tables that existed in original schema
export type HouseRow = {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
};

export type AssignmentRow = {
  id: string;
  house_id: string;
  employee_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_date: string | null;
  completed_at: string | null;
  created_at: string | null;
};

export type EmployeeLocationRow = {
  id: string;
  employee_id: string;
  latitude: number;
  longitude: number;
  timestamp: string | null;
  is_online: boolean;
  last_seen_at: string | null;
};

export type AppointmentRow = {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  user_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  location_id: string;
  description?: string;
  updated_at: string;
};

// Type-safe helper for Supabase function return types
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;
