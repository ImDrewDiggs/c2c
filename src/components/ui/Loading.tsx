
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  fullscreen?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const Loading: React.FC<LoadingProps> = ({ 
  fullscreen = true, 
  size = 'medium' 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };
  
  return (
    <div className={cn(
      "flex justify-center items-center",
      fullscreen ? "min-h-screen" : "p-4"
    )}>
      <Loader2 className={cn(
        sizeClasses[size], 
        "animate-spin text-primary"
      )} />
    </div>
  );
};

export default React.memo(Loading);
