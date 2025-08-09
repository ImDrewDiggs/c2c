import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrderRow {
  id: string;
  user_id: string;
  total: number;
  status: string;
  customer_email: string | null;
  created_at: string;
  payment_method: string | null;
  currency: string | null;
}

export function useOrders() {
  return useQuery({
    queryKey: ["adminOrders"],
    queryFn: async (): Promise<OrderRow[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("id,user_id,total,status,customer_email,created_at,payment_method,currency")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as OrderRow[];
    },
  });
}
