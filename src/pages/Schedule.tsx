import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Clock, MapPin } from "lucide-react";

// Temporary interface until AppointmentRow is available
interface TempAppointment {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description?: string;
  status: string;
  user_id?: string;
  location_id?: string;
}

export default function Schedule() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Temporarily return empty array until appointments table is created
  const appointments: TempAppointment[] = [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      // Temporarily disabled until appointments table is created
      console.log('Would create appointment:', { title, startDate, endDate, description });
      
      toast({
        title: "Feature Coming Soon",
        description: "Appointment scheduling will be available once the appointments table is set up.",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create appointment. Please try again.",
      });
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground">
          Manage your pickup appointments and service schedule
        </p>
      </div>

      <div className="grid gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Schedule new appointments and manage your calendar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Schedule Pickup
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Schedule New Appointment</DialogTitle>
                    <DialogDescription>
                      Create a new pickup appointment. Fill out the details below.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Regular Pickup, Special Collection"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="start-date">Start Date & Time *</Label>
                        <Input
                          id="start-date"
                          type="datetime-local"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="end-date">End Date & Time *</Label>
                        <Input
                          id="end-date"
                          type="datetime-local"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Additional notes or special instructions..."
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Schedule Appointment
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                View Service Areas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              View and manage your scheduled appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px]">
              {appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <CalendarDays className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Appointments Scheduled</h3>
                  <p className="text-muted-foreground mb-4">
                    Appointment scheduling will be available once the database is fully set up.
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    Schedule Your First Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div key={apt.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{apt.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(apt.start_time).toLocaleDateString()} - {new Date(apt.end_time).toLocaleDateString()}
                          </p>
                          {apt.description && (
                            <p className="text-sm mt-2">{apt.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm px-2 py-1 rounded bg-muted">
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}