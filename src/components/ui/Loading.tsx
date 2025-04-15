
import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading: React.FC = () => (
  <div className="flex justify-center items-center min-h-screen">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

export default Loading;
