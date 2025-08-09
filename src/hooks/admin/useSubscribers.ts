import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SubscriberRow {
  id: string;
  user_id: string | null;
  email: string;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  created_at: string;
  updated_at: string;
}

export function useSubscribers() {
  return useQuery({
    queryKey: ["adminSubscribers"],
    queryFn: async (): Promise<SubscriberRow[]> => {
      const { data, error } = await supabase
        .from("subscribers")
        .select("id,user_id,email,subscribed,subscription_tier,subscription_end,created_at,updated_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SubscriberRow[];
    },
  });
}
