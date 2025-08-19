import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Send, X } from "lucide-react";

interface ReportIssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  assignmentId?: string;
}

export function ReportIssueModal({ open, onOpenChange, userId, assignmentId }: ReportIssueModalProps) {
  const { toast } = useToast();
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const issueTypes = [
    { value: "damaged_can", label: "Damaged Can/Container" },
    { value: "blocked_access", label: "Blocked Access" },
    { value: "safety_hazard", label: "Safety Hazard" },
    { value: "equipment_failure", label: "Equipment Failure" },
    { value: "customer_complaint", label: "Customer Complaint" },
    { value: "route_issue", label: "Route Issue" },
    { value: "weather_delay", label: "Weather Delay" },
    { value: "vehicle_problem", label: "Vehicle Problem" },
    { value: "other", label: "Other" }
  ];

  const handleSubmitIssue = async () => {
    if (!issueType || !description.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select an issue type and provide a description."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit issue report - could go to messages table with high priority
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          subject: `Issue Report: ${issueTypes.find(t => t.value === issueType)?.label}`,
          content: description,
          message_type: 'issue_report',
          priority: priority === 'urgent' ? 'high' : 'normal',
          status: 'sent'
        });

      if (error) throw error;

      // If this is related to a specific assignment, you might also want to update the assignment
      if (assignmentId) {
        await supabase
          .from('assignments')
          .update({
            status: 'blocked' // or create a separate issues table
          })
          .eq('id', assignmentId);
      }

      toast({
        title: "Issue Reported",
        description: "Your issue report has been submitted successfully."
      });

      // Reset form
      setIssueType("");
      setDescription("");
      setPriority("normal");
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting issue:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit issue report. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIssueType("");
    setDescription("");
    setPriority("normal");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>⚠️ Report Issue</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="issue-type">Issue Type</Label>
            <Select value={issueType} onValueChange={setIssueType}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                {issueTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Please describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {description.length}/1000 characters
            </div>
          </div>

          {assignmentId && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <strong>Related Job:</strong> #{assignmentId.substring(0, 8)}
            </div>
          )}

          {priority === 'emergency' && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-md">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Emergency Report</p>
                  <p className="text-red-700">
                    This will be sent immediately to dispatch and management.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
            
            <Button 
              size="sm"
              className="flex-1"
              onClick={handleSubmitIssue}
              disabled={isSubmitting || !issueType || !description.trim()}
              variant={priority === 'emergency' ? 'destructive' : 'default'}
            >
              <Send className="mr-1 h-3 w-3" />
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}