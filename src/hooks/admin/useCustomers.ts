import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CustomerData {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  created_at: string;
  subscription_status: 'active' | 'inactive';
  subscription_tier: string | null;
  subscription_end: string | null;
}

export function useCustomers(searchTerm = "") {
  return useQuery({
    queryKey: ["adminCustomers", searchTerm],
    queryFn: async (): Promise<CustomerData[]> => {
      // Get customer roles first
      const { data: customerRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "customer")
        .eq("is_active", true);
      
      if (rolesError) throw rolesError;

      const customerIds = customerRoles?.map(r => r.user_id) || [];
      if (customerIds.length === 0) return [];

      // Get customer profiles
      let profilesQuery = supabase
        .from("profiles")
        .select("id,full_name,email,phone,address,created_at")
        .in("id", customerIds)
        .order("created_at", { ascending: false });

      // Strip characters that have meaning in PostgREST filter syntax
      const safeTerm = searchTerm.replace(/[^\p{L}\p{N}\s@.\-']/gu, "").trim().slice(0, 100);
      if (safeTerm) {
        profilesQuery = profilesQuery.or(
          `full_name.ilike.%${safeTerm}%,email.ilike.%${safeTerm}%,address.ilike.%${safeTerm}%`
        );
      }

      const { data: profiles, error: profilesError } = await profilesQuery;
      if (profilesError) throw profilesError;

      // Get subscriber data
      const { data: subscribers, error: subscribersError } = await supabase
        .from("subscribers")
        .select("user_id,subscribed,subscription_tier,subscription_end")
        .in("user_id", customerIds);
      if (subscribersError) throw subscribersError;

      // Combine data
      return (profiles || []).map(profile => {
        const subscriber = subscribers?.find(s => s.user_id === profile.id);
        return {
          ...profile,
          subscription_status: (subscriber?.subscribed ? 'active' : 'inactive') as CustomerData['subscription_status'],
          subscription_tier: subscriber?.subscription_tier || null,
          subscription_end: subscriber?.subscription_end || null,
        };
      });
    },
  });
}