
export interface Location {
  latitude: number;
  longitude: number;
}

export interface EmployeeLocation {
  id: string;
  name: string;
  location: Location;
  status: 'active' | 'inactive' | 'on_break';
  lastUpdated: string;
}

export interface House {
  id: string;
  address: string;
  location: Location;
  customerName: string;
  serviceType: string;
}

export interface Assignment {
  id: string;
  houseId: string;
  employeeId: string;
  scheduledTime: string;
  status: 'pending' | 'in_progress' | 'completed' | 'canceled';
}
