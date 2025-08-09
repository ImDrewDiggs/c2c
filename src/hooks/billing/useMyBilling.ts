import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MyOrderRow {
  id: string;
  total: number;
  status: string;
  created_at: string;
  currency: string | null;
}

export interface MySubscriberRow {
  id: string;
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  email: string;
}

export function useMyOrders(userId: string | undefined) {
  return useQuery({
    queryKey: ["myOrders", userId],
    enabled: !!userId,
    queryFn: async (): Promise<MyOrderRow[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,total,status,created_at,currency")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MyOrderRow[];
    },
  });
}

export function useMySubscriber(userId: string | undefined, email: string | undefined | null) {
  return useQuery({
    queryKey: ["mySubscriber", userId, email],
    enabled: !!userId || !!email,
    queryFn: async (): Promise<MySubscriberRow | null> => {
      // Try user_id first, fallback to email as permitted by RLS
      const byUser = userId
        ? await supabase
            .from("subscribers")
            .select("id,subscribed,subscription_tier,subscription_end,email")
            .eq("user_id", userId)
            .maybeSingle()
        : { data: null, error: null } as any;

      if (byUser && byUser.data) return byUser.data as MySubscriberRow;

      if (email) {
        const byEmail = await supabase
          .from("subscribers")
          .select("id,subscribed,subscription_tier,subscription_end,email")
          .eq("email", email)
          .maybeSingle();
        if (byEmail.error) throw byEmail.error;
        return (byEmail.data as MySubscriberRow) || null;
      }

      return null;
    },
  });
}
