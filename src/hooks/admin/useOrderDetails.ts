import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrderItemRow {
  id: string;
  order_id: string;
  service_id: string | null;
  description: string | null;
  quantity: number;
  unit_amount: number;
  total_amount: number | null;
}

export interface PaymentRow {
  id: string;
  order_id: string | null;
  subscription_id: string | null;
  user_id: string;
  amount: number;
  status: string;
  payment_method: string;
  currency: string;
  processed_at: string | null;
}

export function useOrderDetails(orderId: string | null) {
  return useQuery({
    queryKey: ["adminOrderDetails", orderId],
    enabled: !!orderId,
    queryFn: async () => {
      const [itemsRes, paymentsRes] = await Promise.all([
        supabase
          .from("order_items")
          .select("id,order_id,service_id,description,quantity,unit_amount,total_amount")
          .eq("order_id", orderId!),
        supabase
          .from("payments")
          .select("id,order_id,subscription_id,user_id,amount,status,payment_method,currency,processed_at")
          .eq("order_id", orderId!),
      ]);

      if (itemsRes.error) throw itemsRes.error;
      if (paymentsRes.error) throw paymentsRes.error;

      return {
        items: (itemsRes.data || []) as OrderItemRow[],
        payments: (paymentsRes.data || []) as PaymentRow[],
      };
    },
  });
}
