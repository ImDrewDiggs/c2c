
import React, { createContext, useContext, useState, useEffect } from 'react';
import { EmployeeLocation, House, Assignment } from '@/types/map';

// Define the shape of our context data
interface AdminDashboardContextType {
  stats: {
    dailyPickups: number;
    pendingPickups: number;
    todayRevenue: number;
  };
  activeEmployees: number;
  houses: House[];
  assignments: Assignment[];
  employeeLocations: EmployeeLocation[];
  currentLocation: { latitude: number; longitude: number } | null;
  mockRevenueData: { name: string; amount: number }[];
  mockPickups: { id: number; address: string; status: string; scheduledTime: string; assignedTo: string }[];
  isLoading: boolean;
}

// Create the context
const AdminDashboardContext = createContext<AdminDashboardContextType | null>(null);

// Provider component
export function AdminDashboardProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<AdminDashboardContextType>({
    stats: {
      dailyPickups: 0,
      pendingPickups: 0,
      todayRevenue: 0
    },
    activeEmployees: 0,
    houses: [],
    assignments: [],
    employeeLocations: [],
    currentLocation: null,
    mockRevenueData: [],
    mockPickups: [],
    isLoading: true
  });

  // Load mock data
  useEffect(() => {
    // Simulate API request delay
    const timer = setTimeout(() => {
      const mockStats = {
        dailyPickups: 27,
        pendingPickups: 8,
        todayRevenue: 3850
      };
      
      const mockHouses = [
        { id: "h1", address: "123 Main St", location: { latitude: 37.7749, longitude: -122.4194 }, customerName: "John Smith", serviceType: "Residential" },
        { id: "h2", address: "456 Market St", location: { latitude: 37.7833, longitude: -122.4167 }, customerName: "Jane Doe", serviceType: "Commercial" },
        { id: "h3", address: "789 Mission St", location: { latitude: 37.7850, longitude: -122.4200 }, customerName: "Springfield Mall", serviceType: "Commercial" },
        { id: "h4", address: "101 Valencia St", location: { latitude: 37.7700, longitude: -122.4220 }, customerName: "Mike Wilson", serviceType: "Residential" }
      ];
      
      const mockAssignments = [
        { id: "a1", houseId: "h1", employeeId: "emp1", scheduledTime: "09:00 AM", status: 'completed' as const },
        { id: "a2", houseId: "h2", employeeId: "emp2", scheduledTime: "10:30 AM", status: 'in_progress' as const },
        { id: "a3", houseId: "h3", employeeId: "emp3", scheduledTime: "01:45 PM", status: 'pending' as const },
        { id: "a4", houseId: "h4", employeeId: "emp4", scheduledTime: "03:15 PM", status: 'pending' as const }
      ];
      
      const mockEmployeeLocations = [
        { id: "emp1", name: "Alex Johnson", location: { latitude: 37.7749, longitude: -122.4194 }, status: 'active' as const, lastUpdated: "2025-04-25T10:30:00Z" },
        { id: "emp2", name: "Maria Garcia", location: { latitude: 37.7833, longitude: -122.4167 }, status: 'active' as const, lastUpdated: "2025-04-25T10:35:00Z" },
        { id: "emp3", name: "Dave Miller", location: { latitude: 37.7850, longitude: -122.4200 }, status: 'on_break' as const, lastUpdated: "2025-04-25T10:15:00Z" },
        { id: "emp4", name: "Chris Taylor", location: { latitude: 37.7700, longitude: -122.4220 }, status: 'active' as const, lastUpdated: "2025-04-25T10:32:00Z" }
      ];
      
      const mockRevenueData = [
        { name: "Jan", amount: 2500 },
        { name: "Feb", amount: 3200 },
        { name: "Mar", amount: 2800 },
        { name: "Apr", amount: 3850 },
        { name: "May", amount: 4000 },
        { name: "Jun", amount: 3500 },
        { name: "Jul", amount: 4200 }
      ];
      
      const mockPickups = [
        { id: 1, address: "123 Main St", status: "Completed", scheduledTime: "09:00 AM", assignedTo: "Alex Johnson" },
        { id: 2, address: "456 Market St", status: "In Progress", scheduledTime: "10:30 AM", assignedTo: "Maria Garcia" },
        { id: 3, address: "789 Mission St", status: "Pending", scheduledTime: "01:45 PM", assignedTo: "Dave Miller" },
        { id: 4, address: "101 Valencia St", status: "Pending", scheduledTime: "03:15 PM", assignedTo: "Chris Taylor" },
        { id: 5, address: "202 Folsom St", status: "Pending", scheduledTime: "04:30 PM", assignedTo: "Alex Johnson" }
      ];

      setDashboardData({
        stats: mockStats,
        activeEmployees: mockEmployeeLocations.filter(emp => emp.status === 'active').length,
        houses: mockHouses,
        assignments: mockAssignments,
        employeeLocations: mockEmployeeLocations,
        currentLocation: { latitude: 37.7749, longitude: -122.4194 },
        mockRevenueData,
        mockPickups,
        isLoading: false
      });
      
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <AdminDashboardContext.Provider value={dashboardData}>
      {children}
    </AdminDashboardContext.Provider>
  );
}

// Custom hook to use the dashboard context
export function useAdminDashboard() {
  const context = useContext(AdminDashboardContext);
  
  if (!context) {
    throw new Error('useAdminDashboard must be used within an AdminDashboardProvider');
  }
  
  return context;
}
