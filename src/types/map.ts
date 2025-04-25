export interface Location {
  latitude: number;
  longitude: number;
}

export interface EmployeeLocation {
  id: string;
  employee_id?: string;
  name: string;
  location: Location;
  status: 'active' | 'inactive' | 'on_break';
  lastUpdated: string;
  timestamp?: string;
  is_online?: boolean;
  last_seen_at?: string;
  latitude?: number; 
  longitude?: number;
}

export interface House {
  id: string;
  address: string;
  location: Location;
  customerName: string;
  serviceType: string;
  latitude?: number;
  longitude?: number;
}

export interface Assignment {
  id: string;
  houseId: string;
  employeeId: string;
  scheduledTime: string;
  status: 'pending' | 'in_progress' | 'completed' | 'canceled';
  assigned_date?: string;
  completed_at?: string;
  house?: House;
}
