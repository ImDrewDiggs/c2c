import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar, CheckCircle2, Navigation, Trash2, Wrench } from "lucide-react";
import { Assignment } from "@/types/map";
import { format } from "date-fns";

interface JobDetailsModalProps {
  assignment: Assignment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkComplete: () => void;
  onViewRoute: () => void;
}

export function JobDetailsModal({ 
  assignment, 
  open, 
  onOpenChange, 
  onMarkComplete, 
  onViewRoute 
}: JobDetailsModalProps) {
  // Mock job details - in a real app, this would come from the assignment data
  const jobDetails = {
    serviceType: "Regular Pickup",
    canCount: 2,
    canSize: "96 gallons",
    specialInstructions: "Gate code: 1234. Please close gate after service. Cans are located behind fence.",
    estimatedTime: "10 minutes",
    priority: "Normal",
    customerNotes: "Prefer early morning pickup if possible",
    lastService: "2024-01-15",
    serviceFrequency: "Weekly"
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Job Details</span>
            <Badge variant="outline" className="ml-2">
              #{assignment.id.substring(0, 8)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Address & Status */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{assignment.house?.address || "Address unavailable"}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(assignment.status)}`} />
                <span className="text-sm capitalize">{assignment.status.replace('_', ' ')}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {assignment.assigned_date ? 
                  format(new Date(assignment.assigned_date), 'MMM d, yyyy') : 
                  "No date assigned"
                }
              </div>
            </div>
          </div>

          <Separator />

          {/* Service Details */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Service Information</h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Service Type:</span>
                <div className="font-medium">{jobDetails.serviceType}</div>
              </div>
              
              <div>
                <span className="text-muted-foreground">Estimated Time:</span>
                <div className="font-medium">{jobDetails.estimatedTime}</div>
              </div>
              
              <div>
                <span className="text-muted-foreground">Can Count:</span>
                <div className="font-medium flex items-center space-x-1">
                  <Trash2 className="h-3 w-3" />
                  <span>{jobDetails.canCount}</span>
                </div>
              </div>
              
              <div>
                <span className="text-muted-foreground">Can Size:</span>
                <div className="font-medium">{jobDetails.canSize}</div>
              </div>
              
              <div>
                <span className="text-muted-foreground">Priority:</span>
                <div className="font-medium">
                  <Badge variant={jobDetails.priority === 'High' ? 'destructive' : 'secondary'}>
                    {jobDetails.priority}
                  </Badge>
                </div>
              </div>
              
              <div>
                <span className="text-muted-foreground">Frequency:</span>
                <div className="font-medium">{jobDetails.serviceFrequency}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Special Instructions */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Special Instructions</h3>
            <div className="text-sm bg-muted p-3 rounded-md">
              {jobDetails.specialInstructions}
            </div>
          </div>

          {/* Customer Notes */}
          {jobDetails.customerNotes && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-medium text-sm">Customer Notes</h3>
                <div className="text-sm bg-blue-50 p-3 rounded-md border-l-4 border-blue-200">
                  {jobDetails.customerNotes}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Required Actions */}
          <div className="space-y-2">
            <h3 className="font-medium text-sm">Required Actions</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>Empty trash cans</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>Return cans to designated area</span>
              </div>
              <div className="flex items-center space-x-2">
                <Wrench className="h-3 w-3 text-muted-foreground" />
                <span>Check for damaged equipment</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => {
                onViewRoute();
                onOpenChange(false);
              }}
            >
              <Navigation className="mr-1 h-3 w-3" />
              Navigate
            </Button>
            
            {assignment.status !== 'completed' && (
              <Button 
                size="sm"
                className="flex-1"
                onClick={() => {
                  onMarkComplete();
                  onOpenChange(false);
                }}
              >
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}