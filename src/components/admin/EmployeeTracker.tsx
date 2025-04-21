
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Card } from '@/components/ui/card';
import { Location, EmployeeLocation } from '@/types/map';
import { InternalEmployeeTracker } from './employee-tracker/InternalEmployeeTracker';

// Create a fallback component for the error boundary
function MapErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <Card className="p-6 bg-red-50 text-red-900">
      <h3 className="font-bold mb-2">Map Error</h3>
      <p className="mb-4">There was an error loading the map component:</p>
      <pre className="bg-white p-4 rounded text-xs overflow-auto mb-4">
        {error.message}
      </pre>
      <button 
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Reload Map
      </button>
    </Card>
  );
}

// Create a wrapper component with error boundary
interface EmployeeTrackerProps {
  employeeLocations?: EmployeeLocation[];
  currentLocation?: Location | null;
}

export function EmployeeTracker({ employeeLocations = [], currentLocation = null }: EmployeeTrackerProps) {
  // Add defensive handling to ensure components get the right props
  const safeEmployeeLocations = Array.isArray(employeeLocations) ? employeeLocations : [];
  
  return (
    <ErrorBoundary 
      FallbackComponent={MapErrorFallback}
      onReset={() => {
        console.log("Map error boundary reset");
      }}
    >
      <InternalEmployeeTracker 
        employeeLocations={safeEmployeeLocations} 
        currentLocation={currentLocation} 
      />
    </ErrorBoundary>
  );
}
