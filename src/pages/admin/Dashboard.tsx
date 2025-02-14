import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, Users, CheckCircle, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Map from "@/components/Map/Map";
import { useState } from "react";
import { House, Assignment } from "@/types/map";

const mockRevenueData = [
  { name: "Mon", amount: 1200 },
  { name: "Tue", amount: 900 },
  { name: "Wed", amount: 1600 },
  { name: "Thu", amount: 1400 },
  { name: "Fri", amount: 2100 },
  { name: "Sat", amount: 800 },
  { name: "Sun", amount: 600 },
];

const mockPickups = [
  {
    id: 1,
    address: "123 Main St",
    status: "Pending",
    scheduledTime: "2:30 PM",
    assignedTo: "John Doe",
  },
  {
    id: 2,
    address: "456 Oak Ave",
    status: "Completed",
    scheduledTime: "3:45 PM",
    assignedTo: "Jane Smith",
  },
];

export default function AdminDashboard() {
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => ({
      dailyPickups: 24,
      weeklyPickups: 168,
      monthlyPickups: 720,
      activeEmployees: 8,
      pendingPickups: 15,
      completedPickups: 9,
      todayRevenue: 2400,
    }),
  });

  const { data: houses = [] } = useQuery<House[]>({
    queryKey: ["houses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("houses")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ["assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  // Get admin's location for map center
  useState(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to a central location if geolocation fails
          setCurrentLocation({
            latitude: 40.7128,
            longitude: -74.0060,
          });
        }
      );
    }
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Calendar className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Today's Pickups</p>
              <h3 className="text-2xl font-bold">{stats?.dailyPickups}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Users className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Active Employees</p>
              <h3 className="text-2xl font-bold">{stats?.activeEmployees}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Clock className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Pending Pickups</p>
              <h3 className="text-2xl font-bold">{stats?.pendingPickups}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <DollarSign className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Today's Revenue</p>
              <h3 className="text-2xl font-bold">${stats?.todayRevenue}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Pickups Timeline & Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Pickups</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Employee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPickups.map((pickup) => (
                <TableRow key={pickup.id}>
                  <TableCell>{pickup.address}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        pickup.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {pickup.status}
                    </span>
                  </TableCell>
                  <TableCell>{pickup.scheduledTime}</TableCell>
                  <TableCell>{pickup.assignedTo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Weekly Revenue</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Live Operations Map */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Live Operations Map</h3>
        <div className="h-[400px]">
          <Map
            houses={houses}
            assignments={assignments}
            currentLocation={currentLocation}
          />
        </div>
      </Card>
    </div>
  );
}
