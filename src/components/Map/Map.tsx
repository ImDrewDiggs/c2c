
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { House, Location, Assignment, EmployeeLocation } from '@/types/map';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const employeeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const activeEmployeeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const adminIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const completedHouseIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const pendingHouseIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  houses: House[];
  assignments: Assignment[];
  currentLocation: Location | null;
  employeeLocations?: EmployeeLocation[];
}

// Auto-center map component
function AutoCenter({ currentLocation }: { currentLocation: Location | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (currentLocation) {
      map.setView([currentLocation.latitude, currentLocation.longitude], 13);
    }
  }, [currentLocation, map]);
  
  return null;
}


export default function Map({ houses, assignments, currentLocation, employeeLocations = [] }: MapProps) {
  const { userData } = useAuth();
  const mapRef = useRef<L.Map | null>(null);
  const [loading, setLoading] = useState(true);

  if (!currentLocation) {
    return <div>Loading map...</div>;
  }

  // Get assignment status for each house
  const getHouseStatus = (houseId: string) => {
    const assignment = assignments.find(a => a.house_id === houseId);
    return assignment?.status || 'unassigned';
  };

  // Get assigned employee for each house
  const getAssignedEmployee = (houseId: string) => {
    const assignment = assignments.find(a => a.house_id === houseId);
    return assignment?.employee_id || null;
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={[currentLocation.latitude, currentLocation.longitude]}
        zoom={13}
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Current location marker */}
        {currentLocation && (
          <Marker 
            position={[currentLocation.latitude, currentLocation.longitude]}
            icon={userData?.role === 'admin' ? adminIcon : activeEmployeeIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">
                  {userData?.role === 'admin' ? 'Admin Location' : 'Your Location'}
                </p>
                <p className="text-gray-600">
                  Last updated: {new Date().toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Employee location markers */}
        {employeeLocations && employeeLocations.map((employee) => (
          <Marker
            key={employee.employee_id}
            position={[employee.latitude, employee.longitude]}
            icon={employee.is_online ? activeEmployeeIcon : employeeIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">Employee ID: {employee.employee_id}</p>
                <p className="text-xs text-gray-600">
                  Status: {employee.is_online ? 'Active' : 'Inactive'}
                </p>
                <p className="text-xs text-gray-600">
                  Last seen: {new Date(employee.last_seen_at || '').toLocaleString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* House markers */}
        {houses && houses.map((house) => {
          const status = getHouseStatus(house.id);
          const icon = status === 'completed' ? completedHouseIcon : 
                       status === 'pending' ? pendingHouseIcon : L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          });
          
          return (
            <Marker
              key={house.id}
              position={[house.latitude, house.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{house.address}</p>
                  <p className="text-gray-600">
                    Status: <span className="capitalize">{status}</span>
                  </p>
                  {getAssignedEmployee(house.id) && (
                    <p className="text-gray-600">
                      Assigned to: Employee {getAssignedEmployee(house.id)}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        <AutoCenter currentLocation={currentLocation} />
      </MapContainer>
    </div>
  );
}
