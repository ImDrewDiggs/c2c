
export interface Location {
  latitude: number;
  longitude: number;
}

export interface EmployeeLocation {
  id: string;
  employee_id: string; // Added this field
  name: string;
  location: Location;
  status: 'active' | 'inactive' | 'on_break';
  lastUpdated: string;
  timestamp?: string; // Added this field
  is_online?: boolean; // Added this field
  last_seen_at?: string; // Added this field
  latitude?: number; // Added directly for backward compatibility
  longitude?: number; // Added directly for backward compatibility
}

export interface House {
  id: string;
  address: string;
  location: Location;
  customerName: string;
  serviceType: string;
  latitude?: number; // Added directly for backward compatibility
  longitude?: number; // Added directly for backward compatibility
}

export interface Assignment {
  id: string;
  houseId: string;
  employeeId: string;
  scheduledTime: string;
  status: 'pending' | 'in_progress' | 'completed' | 'canceled';
  assigned_date?: string; // Added this field
  completed_at?: string; // Added this field
  house?: House; // Added this field to reference the house details
}
