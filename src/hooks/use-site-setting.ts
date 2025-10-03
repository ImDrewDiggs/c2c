import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSiteSetting<T = any>(key: string, defaultValue: T): { value: T; loading: boolean; error?: string } {
  const [value, setValue] = useState<T>(defaultValue as T);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    async function fetchSetting() {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', key)
          .maybeSingle();

        if (error) throw error;
        if (isMounted && data) setValue(data.value as T);
      } catch (e: any) {
        if (isMounted) setError(e.message || 'Failed to load setting');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSetting();

    // Realtime subscribe to updates for this key
    const channel = supabase
      .channel(`site_settings_${key}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings', filter: `key=eq.${key}` }, (payload) => {
        const newValue = (payload.new as any)?.value;
        if (newValue !== undefined) setValue(newValue as T);
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [key]);

  return { value, loading, error };
}
