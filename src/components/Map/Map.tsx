
import React from 'react';
import { Card } from '@/components/ui/card';
import { House, Assignment, EmployeeLocation, Location } from '@/types/map';
import { MapPin, User } from 'lucide-react';

interface MapProps {
  houses: House[];
  assignments: Assignment[];
  currentLocation: Location | null;
  employeeLocations: EmployeeLocation[];
  focusEmployees?: boolean;
}

const Map = ({ 
  houses, 
  assignments, 
  currentLocation, 
  employeeLocations,
  focusEmployees = false
}: MapProps) => {
  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Mock map display */}
      <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
        <div className="relative w-full h-full bg-[#EAEDEF] overflow-hidden">
          {/* Grid lines for map */}
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(to right, #DDD 1px, transparent 1px), linear-gradient(to bottom, #DDD 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
          
          {/* Streets */}
          <div className="absolute top-1/4 left-0 w-full h-4 bg-gray-300"></div>
          <div className="absolute top-2/4 left-0 w-full h-6 bg-gray-300"></div>
          <div className="absolute top-3/4 left-0 w-full h-3 bg-gray-300"></div>
          <div className="absolute top-0 left-1/4 h-full w-5 bg-gray-300"></div>
          <div className="absolute top-0 left-2/3 h-full w-8 bg-gray-300"></div>
          
          {/* Houses */}
          {houses.map((house, index) => (
            <div 
              key={index}
              className="absolute w-4 h-4 bg-blue-500 rounded-sm"
              style={{ 
                top: `${10 + (index * 5)}%`, 
                left: `${15 + (index * 10)}%` 
              }}
              title={`House at ${house.address}`}
            ></div>
          ))}
          
          {/* Employees */}
          {employeeLocations.map((employee, index) => (
            <div 
              key={`employee-${index}`}
              className="absolute flex flex-col items-center"
              style={{ 
                top: `${20 + (index * 15)}%`, 
                left: `${30 + (index * 15)}%`,
                zIndex: 10
              }}
            >
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                <User size={16} />
              </div>
              <div className="mt-1 px-2 py-1 bg-white rounded shadow text-xs">
                {employee.name}
              </div>
            </div>
          ))}
          
          {/* Current location */}
          {currentLocation && (
            <div 
              className="absolute w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
              style={{ 
                top: '50%', 
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 20
              }}
            >
              <MapPin size={14} />
            </div>
          )}
          
          {employeeLocations.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-500">No employee location data available</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center">
          <span className="text-lg">+</span>
        </button>
        <button className="w-8 h-8 bg-white rounded-full shadow flex items-center justify-center">
          <span className="text-lg">-</span>
        </button>
      </div>
    </div>
  );
};

export default Map;
