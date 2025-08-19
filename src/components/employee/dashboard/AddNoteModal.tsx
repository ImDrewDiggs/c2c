import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, X } from "lucide-react";

interface AddNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  assignmentId?: string;
}

export function AddNoteModal({ open, onOpenChange, userId, assignmentId }: AddNoteModalProps) {
  const { toast } = useToast();
  const [note, setNote] = useState("");
  const [noteType, setNoteType] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveNote = async () => {
    if (!note.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a note before saving."
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create a note record - you might have a notes table
      const noteData = {
        content: note,
        user_id: userId,
        assignment_id: assignmentId,
        note_type: noteType,
        created_at: new Date().toISOString()
      };

      // If you have a notes table, insert the note
      // const { error } = await supabase
      //   .from('notes')
      //   .insert(noteData);

      // For now, we'll just simulate saving to the messages table or create a notification
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
          subject: `Job Note - ${noteType}`,
          content: note,
          message_type: 'job_note',
          status: 'sent'
        });

      if (error) throw error;

      toast({
        title: "Note Saved",
        description: "Your note has been saved successfully."
      });

      setNote("");
      setNoteType("general");
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save note. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNote("");
    setNoteType("general");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>📝 Add Note</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note-type">Note Type</Label>
            <Select value={noteType} onValueChange={setNoteType}>
              <SelectTrigger>
                <SelectValue placeholder="Select note type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Note</SelectItem>
                <SelectItem value="service">Service Note</SelectItem>
                <SelectItem value="customer">Customer Note</SelectItem>
                <SelectItem value="equipment">Equipment Note</SelectItem>
                <SelectItem value="safety">Safety Note</SelectItem>
                <SelectItem value="issue">Issue Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note-content">Note Content</Label>
            <Textarea
              id="note-content"
              placeholder="Enter your note here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {note.length}/500 characters
            </div>
          </div>

          {assignmentId && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <strong>Job:</strong> #{assignmentId.substring(0, 8)}
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
              onClick={handleSaveNote}
              disabled={isSubmitting || !note.trim()}
            >
              <Save className="mr-1 h-3 w-3" />
              {isSubmitting ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}