
import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from '@/components/ui/calendar';

interface Appointment {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  user_id: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  location_id: string;
  description?: string;
  updated_at: string;
}

export default function Schedule() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing appointments
  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as Appointment[];
    },
  });

  // Create new appointment
  const createAppointment = useMutation({
    mutationFn: async (date: Date) => {
      const { data, error } = await supabase
        .from('appointments')
        .insert([
          {
            title: 'Pickup',
            start_time: date.toISOString(),
            end_time: new Date(date.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
            status: 'pending',
            location_id: '1', // You might want to make this dynamic based on user's location
            user_id: '1', // This should be the actual user's ID when authentication is implemented
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Success!",
        description: "Your pickup has been scheduled.",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to schedule pickup. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const handleConfirmAppointment = () => {
    if (selectedDate) {
      createAppointment.mutate(selectedDate);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Schedule a Pickup</h1>
      
      <div className="card p-6">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dateClick={(info) => handleDateClick(info.date)}
          events={appointments.map(apt => ({
            title: apt.title,
            date: apt.start_time,
            backgroundColor: apt.status === 'pending' ? '#FFA500' : '#22C55E',
          }))}
          height="auto"
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Pickup Schedule</DialogTitle>
            <DialogDescription>
              Would you like to schedule a pickup for {selectedDate?.toLocaleDateString()}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmAppointment}>
              Confirm Pickup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
