import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Appointment {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  service_address: string | null;
  start_time: string;
  end_time: string;
  status: string;
  cancelled_at: string | null;
  created_at: string;
}

export interface NewAppointmentInput {
  title: string;
  description?: string;
  serviceAddress?: string;
  startTime: string;
  endTime: string;
}

export function useAppointments() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from("appointments")
      .select("id, user_id, title, description, service_address, start_time, end_time, status, cancelled_at, created_at")
      .order("start_time", { ascending: true });

    if (queryError) {
      setError("We couldn't load your appointments. Please try again.");
      setAppointments([]);
    } else {
      setAppointments((data ?? []) as Appointment[]);
    }

    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const createAppointment = useCallback(
    async (input: NewAppointmentInput): Promise<{ success: boolean; message?: string }> => {
      if (!userId) {
        return { success: false, message: "Please sign in to schedule an appointment." };
      }

      const start = new Date(input.startTime);
      const end = new Date(input.endTime);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return { success: false, message: "Please enter valid dates and times." };
      }
      if (end <= start) {
        return { success: false, message: "The end time must be after the start time." };
      }
      if (start.getTime() < Date.now() - 5 * 60 * 1000) {
        return { success: false, message: "Please choose a time in the future." };
      }

      const { error: insertError } = await supabase.from("appointments").insert({
        user_id: userId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        service_address: input.serviceAddress?.trim() || null,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });

      if (insertError) {
        return { success: false, message: "We couldn't save that appointment. Please try again." };
      }

      await load();
      return { success: true };
    },
    [userId, load]
  );

  const cancelAppointment = useCallback(
    async (id: string): Promise<{ success: boolean; message?: string }> => {
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", id);

      if (updateError) {
        return { success: false, message: "We couldn't cancel that appointment. Please try again." };
      }

      await load();
      return { success: true };
    },
    [load]
  );

  return { appointments, isLoading, error, reload: load, createAppointment, cancelAppointment };
}
