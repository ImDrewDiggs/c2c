import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CalendarIcon, ClockIcon } from 'lucide-react';

interface WorkSession {
  id: string;
  employee_id: string;
  clock_in_time: string;
  clock_out_time: string | null;
  total_hours: number | null;
  status: string;
  notes: string | null;
  profiles?: {
    full_name: string | null;
    email: string;
  } | null;
}

interface TimeAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: WorkSession | null;
  onSessionUpdated: () => void;
}

export function TimeAdjustmentModal({ isOpen, onClose, session, onSessionUpdated }: TimeAdjustmentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    clockInDate: '',
    clockInTime: '',
    clockOutDate: '',
    clockOutTime: '',
    status: '',
    adjustmentReason: ''
  });

  React.useEffect(() => {
    if (session) {
      const clockInDate = new Date(session.clock_in_time);
      const clockOutDate = session.clock_out_time ? new Date(session.clock_out_time) : null;

      setFormData({
        clockInDate: clockInDate.toISOString().split('T')[0],
        clockInTime: clockInDate.toTimeString().slice(0, 5),
        clockOutDate: clockOutDate?.toISOString().split('T')[0] || '',
        clockOutTime: clockOutDate?.toTimeString().slice(0, 5) || '',
        status: session.status,
        adjustmentReason: ''
      });
    }
  }, [session]);

  const calculateHours = (clockIn: Date, clockOut: Date): number => {
    const diffMs = clockOut.getTime() - clockIn.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setIsLoading(true);
    try {
      // Construct full datetime strings
      const clockInDateTime = new Date(`${formData.clockInDate}T${formData.clockInTime}`);
      const clockOutDateTime = formData.clockOutDate && formData.clockOutTime 
        ? new Date(`${formData.clockOutDate}T${formData.clockOutTime}`)
        : null;

      // Validate times
      if (clockOutDateTime && clockOutDateTime <= clockInDateTime) {
        toast({
          title: "Invalid Times",
          description: "Clock out time must be after clock in time",
          variant: "destructive"
        });
        return;
      }

      // Calculate total hours if both times are provided
      const totalHours = clockOutDateTime ? calculateHours(clockInDateTime, clockOutDateTime) : null;
      const status = clockOutDateTime ? 'completed' : 'active';

      // Prepare update data
      const updateData: any = {
        clock_in_time: clockInDateTime.toISOString(),
        status: formData.status || status,
        total_hours: totalHours,
        notes: formData.adjustmentReason ? 
          `${session.notes ? session.notes + '\n\n' : ''}ADMIN ADJUSTMENT: ${formData.adjustmentReason}` : 
          session.notes,
        updated_at: new Date().toISOString()
      };

      if (clockOutDateTime) {
        updateData.clock_out_time = clockOutDateTime.toISOString();
      }

      // Update the work session
      const { error } = await supabase
        .from('work_sessions')
        .update(updateData)
        .eq('id', session.id);

      if (error) throw error;

      // Log the adjustment for audit purposes
      await supabase.from('enhanced_security_logs').insert({
        action_type: 'work_session_adjustment',
        resource_type: 'work_sessions',
        resource_id: session.id,
        old_values: {
          clock_in_time: session.clock_in_time,
          clock_out_time: session.clock_out_time,
          total_hours: session.total_hours,
          status: session.status
        },
        new_values: updateData,
        risk_level: 'medium',
        metadata: {
          employee_id: session.employee_id,
          adjustment_reason: formData.adjustmentReason,
          admin_action: true
        }
      });

      toast({
        title: "Time Adjusted",
        description: `Work session updated for ${session.profiles?.full_name || 'employee'}`,
      });

      onSessionUpdated();
      onClose();
    } catch (error) {
      console.error('Error adjusting time:', error);
      toast({
        title: "Error",
        description: "Failed to adjust work session time",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Adjust Work Session Time
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Employee: {session.profiles?.full_name || session.profiles?.email}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Clock In Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Clock In Time</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="clockInDate" className="text-xs text-muted-foreground">Date</Label>
                <Input
                  id="clockInDate"
                  type="date"
                  value={formData.clockInDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, clockInDate: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clockInTime" className="text-xs text-muted-foreground">Time</Label>
                <Input
                  id="clockInTime"
                  type="time"
                  value={formData.clockInTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, clockInTime: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Clock Out Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Clock Out Time (Optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="clockOutDate" className="text-xs text-muted-foreground">Date</Label>
                <Input
                  id="clockOutDate"
                  type="date"
                  value={formData.clockOutDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, clockOutDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="clockOutTime" className="text-xs text-muted-foreground">Time</Label>
                <Input
                  id="clockOutTime"
                  type="time"
                  value={formData.clockOutTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, clockOutTime: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="adjusted">Adjusted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Adjustment Reason */}
          <div className="space-y-2">
            <Label htmlFor="adjustmentReason">Adjustment Reason *</Label>
            <Textarea
              id="adjustmentReason"
              placeholder="Please provide a reason for this time adjustment..."
              value={formData.adjustmentReason}
              onChange={(e) => setFormData(prev => ({ ...prev, adjustmentReason: e.target.value }))}
              required
              rows={3}
            />
          </div>

          {/* Calculated Hours Display */}
          {formData.clockInDate && formData.clockInTime && formData.clockOutDate && formData.clockOutTime && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Calculated Hours:</p>
              <p className="text-lg font-semibold text-primary">
                {calculateHours(
                  new Date(`${formData.clockInDate}T${formData.clockInTime}`),
                  new Date(`${formData.clockOutDate}T${formData.clockOutTime}`)
                )} hours
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adjusting...' : 'Adjust Time'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}