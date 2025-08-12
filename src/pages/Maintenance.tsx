import React, { useEffect } from 'react';

export default function Maintenance() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'Maintenance | System Temporary Unavailable';
    return () => { document.title = prev; };
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <main className="max-w-2xl text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Scheduled Maintenance</h1>
        <p className="text-muted-foreground">
          Our system is currently undergoing maintenance. Please check back soon. Administrators can still access the system during this time.
        </p>
        <p className="text-sm text-muted-foreground">
          Thank you for your patience and understanding.
        </p>
      </main>
    </div>
  );
}
