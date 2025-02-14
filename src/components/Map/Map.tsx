
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { House, Location, Assignment } from '@/types/map';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  houses: House[];
  assignments: Assignment[];
  currentLocation: Location | null;
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

export default function Map({ houses, assignments, currentLocation }: MapProps) {
  const { user } = useAuth();
  const mapRef = useRef<L.Map | null>(null);
  const [loading, setLoading] = useState(true);

  // Update employee location in real-time
  useEffect(() => {
    if (!user || !currentLocation) return;

    const updateLocation = async () => {
      const { error } = await supabase
        .from('employee_locations')
        .upsert({
          employee_id: user.id,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          timestamp: new Date().toISOString(),
        }, {
          onConflict: 'employee_id'
        });

      if (error) {
        console.error('Error updating location:', error);
      }
    };

    updateLocation();
  }, [currentLocation, user]);

  if (!currentLocation) {
    return <div>Loading map...</div>;
  }

  return (
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
      <Marker position={[currentLocation.latitude, currentLocation.longitude]}>
        <Popup>Your current location</Popup>
      </Marker>

      {/* House markers */}
      {houses.map((house) => (
        <Marker
          key={house.id}
          position={[house.latitude, house.longitude]}
          icon={L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #4F46E5; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>`,
            iconSize: [10, 10],
          })}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{house.address}</p>
              <p className="text-gray-600">
                Status: {assignments.find(a => a.house_id === house.id)?.status || 'unassigned'}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}

      <AutoCenter currentLocation={currentLocation} />
    </MapContainer>
  );
}
