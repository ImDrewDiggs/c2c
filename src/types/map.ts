
export interface Location {
  latitude: number;
  longitude: number;
}

export interface House extends Location {
  id: string;
  address: string;
}

export interface EmployeeLocation {
  employee_id: string;
  latitude: number;
  longitude: number;
  timestamp?: string;
  is_online?: boolean;
  last_seen_at?: string;
}

export interface Assignment {
  id: string;
  house_id: string;
  employee_id: string;
  status: string;
  assigned_date: string;
  completed_at?: string;
  house: House;
}
