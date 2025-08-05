import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Square, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimeTrackerProps {
  userId: string;
}

export function TimeTracker({ userId }: TimeTrackerProps) {
  const { toast } = useToast();
  const [isWorking, setIsWorking] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  
  // Mock data until work_sessions table is created
  const sessions = [];
  const totalHours = 0;

  const handleClockIn = async () => {
    // Temporarily disabled until work_sessions table is created
    console.log('Would clock in for user:', userId);
    setIsWorking(true);
    toast({
      title: "Feature Coming Soon",
      description: "Time tracking will be available once all database tables are set up.",
    });
  };

  const handleClockOut = async () => {
    // Temporarily disabled until work_sessions table is created
    console.log('Would clock out for user:', userId);
    setIsWorking(false);
    toast({
      title: "Feature Coming Soon", 
      description: "Time tracking will be available once all database tables are set up.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Clock In/Out Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Tracker
          </CardTitle>
          <CardDescription>
            Track your work hours and manage your schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Current Status</p>
              <Badge variant={isWorking ? "default" : "secondary"}>
                {isWorking ? "Working" : "Not Working"}
              </Badge>
            </div>
            <div className="flex gap-2">
              {!isWorking ? (
                <Button onClick={handleClockIn} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Clock In
                </Button>
              ) : (
                <Button onClick={handleClockOut} variant="destructive" className="flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  Clock Out
                </Button>
              )}
            </div>
          </div>

          {/* Today's Hours */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Hours Today</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{sessions.length}</p>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">Coming Soon</p>
              <p className="text-sm text-muted-foreground">Status</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Sessions
          </CardTitle>
          <CardDescription>Your recent work sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Time tracking system is being set up.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Database tables are being created for the time tracking system.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}