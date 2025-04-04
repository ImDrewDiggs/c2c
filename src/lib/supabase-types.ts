
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

export interface WorkSessionRow {
  id: string;
  employee_id: string;
  clock_in: string;
  clock_out: string | null;
  total_hours: number | null;
  is_active: boolean;
  created_at: string;
}

export interface CustomerSubscriptionRow {
  id: string;
  customer_id: string;
  subscription_id: string;
  created_at: string;
  updated_at: string;
}

export interface AppointmentRow {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  user_id: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  location_id: string | null;
  description?: string;
  updated_at: string;
}

export interface SubscriptionRow {
  id: string;
  user_id: string | null;
  plan_id: string | null;
  start_date: string;
  next_service_date: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  service_plans?: {
    id: string;
    name: string;
    price: number;
    description: string | null;
    frequency: string;
    created_at: string;
  };
}

export interface ServiceLogRow {
  id: string;
  subscription_id: string | null;
  employee_id: string | null;
  scheduled_date: string;
  completed_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  employee?: {
    id: string;
    full_name: string | null;
  };
  subscription?: {
    id: string;
    service_plans?: {
      id: string;
      name: string;
    };
  };
}
