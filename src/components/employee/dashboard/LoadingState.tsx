
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  size?: 'small' | 'medium' | 'large';
  fullscreen?: boolean;
  message?: string;
}

export function LoadingState({ 
  size = 'medium', 
  fullscreen = true,
  message
}: LoadingStateProps) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };
  
  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      fullscreen ? "min-h-screen" : "p-4"
    )}>
      <Loader2 className={cn(
        sizeClasses[size], 
        "animate-spin text-primary"
      )} />
      {message && (
        <p className="mt-2 text-sm text-gray-400">{message}</p>
      )}
    </div>
  );
}
