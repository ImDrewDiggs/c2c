
import React from 'react';
import { Card } from '@/components/ui/card';
import { Location, EmployeeLocation } from '@/types/map';
import Map from '@/components/Map/Map';

interface InternalEmployeeTrackerProps {
  employeeLocations: EmployeeLocation[];
  currentLocation: Location | null;
}

export function InternalEmployeeTracker({ 
  employeeLocations, 
  currentLocation 
}: InternalEmployeeTrackerProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">Employee Location Tracker</h3>
      <div className="h-[600px]">
        <Map
          houses={[]}
          assignments={[]}
          currentLocation={currentLocation}
          employeeLocations={employeeLocations}
          focusEmployees={true}
        />
      </div>
    </Card>
  );
}
