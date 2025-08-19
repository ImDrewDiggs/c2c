import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Send, X } from "lucide-react";

interface MessageAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function MessageAdminModal({ open, onOpenChange, userId }: MessageAdminModalProps) {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("general");
  const [priority, setPriority] = useState("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const messageTypes = [
    { value: "general", label: "General Question" },
    { value: "schedule", label: "Schedule Request" },
    { value: "assistance", label: "Request Assistance" },
    { value: "equipment", label: "Equipment Issue" },
    { value: "route", label: "Route Question" },
    { value: "customer", label: "Customer Issue" },
    { value: "emergency", label: "Emergency" },
    { value: "other", label: "Other" }
  ];

  const handleSendMessage = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide both a subject and message."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          subject: subject,
          content: message,
          message_type: messageType,
          priority: priority,
          status: 'sent'
        });

      if (error) throw error;

      toast({
        title: "Message Sent",
        description: "Your message has been sent to the admin team."
      });

      // Reset form
      setSubject("");
      setMessage("");
      setMessageType("general");
      setPriority("normal");
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSubject("");
    setMessage("");
    setMessageType("general");
    setPriority("normal");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>📩 Message Admin</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message-type">Message Type</Label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue placeholder="Select message type" />
              </SelectTrigger>
              <SelectContent>
                {messageTypes.map((type) => (
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
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter message subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
            />
            <div className="text-xs text-muted-foreground text-right">
              {subject.length}/100 characters
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {message.length}/1000 characters
            </div>
          </div>

          {priority === 'urgent' && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-md">
              <div className="text-sm">
                <p className="font-medium text-red-800">Urgent Message</p>
                <p className="text-red-700">
                  This message will be prioritized and sent to all available admins.
                </p>
              </div>
            </div>
          )}

          {messageType === 'emergency' && (
            <div className="bg-red-100 border border-red-300 p-3 rounded-md">
              <div className="text-sm">
                <p className="font-medium text-red-900">Emergency Message</p>
                <p className="text-red-800">
                  For immediate emergencies, also call the emergency hotline: <strong>(555) 123-HELP</strong>
                </p>
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
              onClick={handleSendMessage}
              disabled={isSubmitting || !subject.trim() || !message.trim()}
            >
              <Send className="mr-1 h-3 w-3" />
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}