
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  fullscreen?: boolean;
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

const Loading = React.memo(({ 
  fullscreen = true, 
  size = 'medium',
  message,
  className
}: LoadingProps) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };
  
  return (
    <div className={cn(
      "flex flex-col justify-center items-center",
      fullscreen ? "min-h-screen" : "p-4",
      className
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
});

Loading.displayName = 'Loading';

export default Loading;
