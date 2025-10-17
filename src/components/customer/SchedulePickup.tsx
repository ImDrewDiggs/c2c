import { useState } from "react";
import { Calendar, Clock, MapPin, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SchedulePickupProps {
  userId: string;
}

const SchedulePickup = ({ userId }: SchedulePickupProps) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [serviceType, setServiceType] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    "8:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 2:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM"
  ];

  const serviceTypes = [
    { value: "regular", label: "Regular Pickup" },
    { value: "recycling", label: "Recycling" },
    { value: "hazardous", label: "Hazardous Materials" },
    { value: "bulk", label: "Bulk Items" }
  ];

  const handleSchedule = async () => {
    if (!date || !timeSlot || !serviceType) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Pickup Scheduled!",
        description: `Your ${serviceTypes.find(s => s.value === serviceType)?.label} is scheduled for ${format(date, "PPP")} at ${timeSlot}.`
      });
      
      // Reset form
      setDate(undefined);
      setTimeSlot("");
      setServiceType("");
      setNotes("");
      setLoading(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Schedule a Pickup
        </CardTitle>
        <CardDescription>
          Request a service pickup at your convenience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Service Type *</Label>
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger>
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Pickup Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Time Slot *</Label>
          <Select value={timeSlot} onValueChange={setTimeSlot}>
            <SelectTrigger>
              <SelectValue placeholder="Select time slot" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map(slot => (
                <SelectItem key={slot} value={slot}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {slot}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Special Instructions (Optional)</Label>
          <Textarea
            placeholder="Any special instructions for the pickup crew..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <Button 
          onClick={handleSchedule} 
          disabled={loading || !date || !timeSlot || !serviceType}
          className="w-full"
        >
          {loading ? "Scheduling..." : "Schedule Pickup"}
        </Button>

        <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
          <p className="font-semibold">Important Notes:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Pickups are scheduled during business hours (8 AM - 6 PM)</li>
            <li>Same-day pickups available for ELITE members only</li>
            <li>Hazardous materials require 48-hour advance notice</li>
            <li>Bulk items may incur additional fees</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchedulePickup;
