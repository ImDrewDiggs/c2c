
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MapPin, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { Assignment } from "@/types/map";
import { format } from "date-fns";

interface JobAssignmentsProps {
  assignments: Assignment[];
  onViewRoute: (assignment: Assignment) => void;
  onMarkComplete: (assignment: Assignment) => void;
}

export function JobAssignments({ assignments, onViewRoute, onMarkComplete }: JobAssignmentsProps) {
  const [activeTab, setActiveTab] = useState("pending");
  
  // Filter assignments based on status
  const pendingAssignments = assignments.filter(
    a => a.status === "pending" || a.status === "in_progress"
  );
  const completedAssignments = assignments.filter(a => a.status === "completed");
  
  // Sort assignments by date (most recent assigned date first)
  const sortedPending = [...pendingAssignments].sort((a, b) => {
    if (!a.assigned_date) return 1;
    if (!b.assigned_date) return -1;
    return new Date(b.assigned_date).getTime() - new Date(a.assigned_date).getTime();
  });
  
  const sortedCompleted = [...completedAssignments].sort((a, b) => {
    if (!a.completed_at) return 1;
    if (!b.completed_at) return -1;
    return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
  });
  
  // Function to render assignment cards
  const renderAssignmentCard = (assignment: Assignment) => {
    const isCompleted = assignment.status === "completed";
    
    return (
      <Card key={assignment.id} className="mb-3 overflow-hidden border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-2">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">{assignment.house?.address || "Address unavailable"}</h3>
              <Badge variant={isCompleted ? "outline" : "default"}>
                {assignment.status}
              </Badge>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {assignment.assigned_date ? 
                  format(new Date(assignment.assigned_date), 'MMM d, yyyy') : 
                  "No date assigned"}
              </div>
              
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                Job #{assignment.id.substring(0, 8)}
              </div>
            </div>
            
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onViewRoute(assignment)}
              >
                <MapPin className="mr-1 h-3 w-3" />
                View Route
              </Button>
              
              {!isCompleted && (
                <Button 
                  variant="default" 
                  size="sm"
                  className="flex-1"
                  onClick={() => onMarkComplete(assignment)}
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          Your Assignments
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="pending">
              Pending ({pendingAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedAssignments.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="h-[calc(100vh-20rem)] overflow-y-auto px-2">
            {sortedPending.length > 0 ? (
              sortedPending.map(renderAssignmentCard)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No pending assignments
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="h-[calc(100vh-20rem)] overflow-y-auto px-2">
            {sortedCompleted.length > 0 ? (
              sortedCompleted.map(renderAssignmentCard)
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No completed assignments
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
