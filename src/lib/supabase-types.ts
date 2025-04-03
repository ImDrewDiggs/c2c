
// Type definitions for Supabase table rows

export interface EmployeeLocationRow {
  id: string;
  employee_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  is_online: boolean;
  last_seen_at: string;
}

export interface HouseRow {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface AssignmentRow {
  id: string;
  house_id: string;
  employee_id: string;
  status: string;
  assigned_date: string;
  completed_at: string;
  created_at: string;
}
