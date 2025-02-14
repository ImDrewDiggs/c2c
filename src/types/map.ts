
export interface Location {
  latitude: number;
  longitude: number;
}

export interface House {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface Assignment {
  id: string;
  house_id: string;
  employee_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_date: string;
  completed_at: string | null;
  created_at: string;
  house?: House;
}

export interface EmployeeLocation {
  id: string;
  employee_id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}
