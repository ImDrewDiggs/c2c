
import React from 'react';
import { Bell, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface DashboardHeaderProps {
  isSuperAdmin?: boolean;
}

export function DashboardHeader({ isSuperAdmin = false }: DashboardHeaderProps) {
  const { toast } = useToast();
  
  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have 3 unread notifications",
    });
  };
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{isSuperAdmin ? ", Super Admin" : ""}! Here's what's happening today.
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-8 w-[200px]" 
          />
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleNotificationClick}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </Button>
        
        <Button variant="outline" className="flex items-center gap-1">
          <span>Today</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
