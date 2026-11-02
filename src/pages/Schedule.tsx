import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAppointments } from "@/hooks/useAppointments";
import { sanitizeInput } from "@/utils/inputSanitization";
import Seo from "@/components/seo/Seo";

const MAX_TITLE = 120;
const MAX_TEXT = 1000;

const formatRange = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const day = s.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const t = (d: Date) => d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${day} · ${t(s)} – ${t(e)}`;
};

export default function Schedule() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { appointments, isLoading, error, createAppointment, cancelAppointment } = useAppointments();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const resetForm = () => {
    setTitle(""); setServiceAddress(""); setDescription(""); setStartDate(""); setEndDate("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!title.trim() || !startDate || !endDate) {
      toast({ variant: "destructive", title: "Missing details", description: "Please fill in all required fields." });
      return;
    }
    setSubmitting(true);
    const result = await createAppointment({
      title: sanitizeInput(title).slice(0, MAX_TITLE),
      serviceAddress: sanitizeInput(serviceAddress).slice(0, MAX_TEXT),
      description: sanitizeInput(description).slice(0, MAX_TEXT),
      startTime: startDate,
      endTime: endDate,
    });
    setSubmitting(false);
    if (result.success) {
      toast({ title: "Appointment scheduled", description: "We've added it to your calendar." });
      resetForm();
      setIsDialogOpen(false);
    } else {
      toast({ variant: "destructive", title: "Couldn't schedule", description: result.message });
    }
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    const result = await cancelAppointment(id);
    setCancellingId(null);
    toast(result.success
      ? { title: "Appointment cancelled" }
      : { variant: "destructive", title: "Couldn't cancel", description: result.message });
  };

  const upcoming = appointments.filter((a) => a.status !== "cancelled" && new Date(a.end_time) >= new Date());
  const minDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return (
    <div className="container mx-auto py-10 px-4 md:px-6">
      <Seo
        title="Schedule a Pickup | Can2Curb"
        description="Schedule trash can pickups and manage your service calendar with Can2Curb's easy online scheduling tools."
        path="/schedule"
      />
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground">Manage your pickup appointments and service schedule</p>
      </div>

      {authLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading" /></div>
      ) : !user ? (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <CalendarDays className="h-12 w-12 mx-auto text-primary" aria-hidden="true" />
            <h2 className="text-xl font-semibold">Sign in to schedule a pickup</h2>
            <p className="text-muted-foreground">Your appointments are private to your account.</p>
            <div className="flex justify-center gap-3">
              <Button asChild><Link to="/customer/login?redirect=%2Fschedule">Sign in</Link></Button>
              <Button asChild variant="outline"><Link to="/customer/register?redirect=%2Fschedule">Create account</Link></Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle as="h2" className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" /> Quick Actions
              </CardTitle>
              <CardDescription>Schedule new appointments and manage your calendar</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2"><Clock className="h-4 w-4" /> Schedule Pickup</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Schedule New Appointment</DialogTitle>
                    <DialogDescription>Create a new pickup appointment. Fill out the details below.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input id="title" value={title} maxLength={MAX_TITLE} required
                          onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Regular Pickup, Special Collection" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="address">Service address</Label>
                        <Input id="address" value={serviceAddress} maxLength={MAX_TEXT} autoComplete="street-address"
                          onChange={(e) => setServiceAddress(e.target.value)} placeholder="123 Main St, Cincinnati" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="start-date">Start Date & Time *</Label>
                        <Input id="start-date" type="datetime-local" min={minDateTime} value={startDate} required
                          onChange={(e) => setStartDate(e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="end-date">End Date & Time *</Label>
                        <Input id="end-date" type="datetime-local" min={startDate || minDateTime} value={endDate} required
                          onChange={(e) => setEndDate(e.target.value)} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" value={description} maxLength={MAX_TEXT} className="min-h-[80px]"
                          onChange={(e) => setDescription(e.target.value)} placeholder="Additional notes or special instructions..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Schedule Appointment"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h2">Upcoming Appointments</CardTitle>
              <CardDescription>View and manage your scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Loading appointments" /></div>
              ) : error ? (
                <p className="text-destructive text-center py-12">{error}</p>
              ) : upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <CalendarDays className="h-16 w-16 text-muted-foreground mb-4" aria-hidden="true" />
                  <h3 className="text-lg font-semibold mb-2">No Appointments Scheduled</h3>
                  <p className="text-muted-foreground mb-4">You don't have any upcoming appointments yet.</p>
                  <Button onClick={() => setIsDialogOpen(true)}>Schedule Your First Appointment</Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {upcoming.map((apt) => (
                    <li key={apt.id} className="p-4 border rounded-lg flex flex-col sm:flex-row sm:justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="font-semibold">{apt.title}</h4>
                        <p className="text-sm text-muted-foreground">{formatRange(apt.start_time, apt.end_time)}</p>
                        {apt.service_address && (
                          <p className="text-sm flex items-center gap-1"><MapPin className="h-3 w-3" aria-hidden="true" />{apt.service_address}</p>
                        )}
                        {apt.description && <p className="text-sm mt-2">{apt.description}</p>}
                      </div>
                      <div className="flex sm:flex-col items-center sm:items-end gap-2">
                        <Badge variant="secondary" className="capitalize">{apt.status}</Badge>
                        <Button size="sm" variant="outline" disabled={cancellingId === apt.id}
                          onClick={() => handleCancel(apt.id)}>
                          {cancellingId === apt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel"}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
