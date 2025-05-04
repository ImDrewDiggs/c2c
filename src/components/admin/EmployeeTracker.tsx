
import React from 'react';
import { EmployeeTracker as OriginalEmployeeTracker } from './employee-tracker/EmployeeTracker';
import { ErrorBoundary } from 'react-error-boundary';
import { Card } from '@/components/ui/card';
import { Location, EmployeeLocation } from '@/types/map';

/**
 * Error fallback component for the map
 * Displays when an error occurs in the map component and provides a way to recover
 */
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

/**
 * Props interface for EmployeeTracker component
 */
interface EmployeeTrackerProps {
  employeeLocations?: EmployeeLocation[]; // Array of employee GPS positions
  currentLocation?: Location | null;      // Current user's location
}

/**
 * EmployeeTracker - Map-based interface for tracking employee locations
 * 
 * This is a wrapper component that adds error handling around the core
 * employee tracking functionality. It ensures that map errors don't
 * crash the entire application.
 */
export function EmployeeTracker({ employeeLocations = [], currentLocation = null }: EmployeeTrackerProps) {
  console.log("EmployeeTracker wrapper rendering with:", { employeeLocations, currentLocation });
  
  return (
    <ErrorBoundary 
      FallbackComponent={MapErrorFallback}
      onReset={() => {
        // Reset any state that might have caused the error
        console.log("Map error boundary reset");
      }}
    >
      <OriginalEmployeeTracker 
        employeeLocations={employeeLocations} 
        currentLocation={currentLocation} 
      />
    </ErrorBoundary>
  );
}
