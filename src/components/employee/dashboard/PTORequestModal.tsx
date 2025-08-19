import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarIcon, Send, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PTORequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function PTORequestModal({ open, onOpenChange, userId }: PTORequestModalProps) {
  const { toast } = useToast();
  const [requestType, setRequestType] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestTypes = [
    { value: "vacation", label: "Vacation" },
    { value: "sick", label: "Sick Leave" },
    { value: "personal", label: "Personal Day" },
    { value: "family", label: "Family Emergency" },
    { value: "medical", label: "Medical Appointment" },
    { value: "bereavement", label: "Bereavement" },
    { value: "other", label: "Other" }
  ];

  const handleSubmitRequest = async () => {
    if (!requestType || !startDate || !reason.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields."
      });
      return;
    }

    if (endDate && endDate < startDate) {
      toast({
        variant: "destructive",
        title: "Invalid Dates",
        description: "End date cannot be before start date."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit PTO request - this could go to a dedicated PTO requests table
      // For now, we'll use the messages table with special message type
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          subject: `PTO Request: ${requestTypes.find(t => t.value === requestType)?.label}`,
          content: JSON.stringify({
            request_type: requestType,
            start_date: startDate.toISOString(),
            end_date: endDate?.toISOString(),
            reason: reason,
            submitted_at: new Date().toISOString()
          }),
          message_type: 'pto_request',
          priority: 'normal',
          status: 'sent'
        });

      if (error) throw error;

      toast({
        title: "PTO Request Submitted",
        description: "Your time off request has been submitted for approval."
      });

      // Reset form
      setRequestType("");
      setStartDate(undefined);
      setEndDate(undefined);
      setReason("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting PTO request:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit PTO request. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRequestType("");
    setStartDate(undefined);
    setEndDate(undefined);
    setReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5" />
            <span>📝 Request Time Off</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="request-type">Request Type</Label>
            <Select value={requestType} onValueChange={setRequestType}>
              <SelectTrigger>
                <SelectValue placeholder="Select request type" />
              </SelectTrigger>
              <SelectContent>
                {requestTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => date < (startDate || new Date())}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for your time off request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {reason.length}/500 characters
            </div>
          </div>

          {startDate && endDate && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
              <div className="text-sm">
                <p className="font-medium text-blue-800">Request Summary</p>
                <p className="text-blue-700">
                  {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s) requested
                </p>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md">
            <p className="font-medium mb-1">Important Notes:</p>
            <ul className="space-y-1">
              <li>• Requests should be submitted at least 2 weeks in advance</li>
              <li>• Emergency requests will be reviewed on a case-by-case basis</li>
              <li>• You will receive notification once your request is reviewed</li>
            </ul>
          </div>

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
              onClick={handleSubmitRequest}
              disabled={isSubmitting || !requestType || !startDate || !reason.trim()}
            >
              <Send className="mr-1 h-3 w-3" />
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}