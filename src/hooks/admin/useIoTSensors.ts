import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface IoTSensor {
  id: string;
  name: string;
  sensor_type: string;
  device_id: string;
  api_key: string;
  description: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_label: string | null;
  metadata: Record<string, unknown>;
  alert_thresholds: Record<string, { min?: number; max?: number }>;
  status: string;
  last_reading_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface IoTSensorReading {
  id: string;
  sensor_id: string;
  reading_type: string;
  value: number;
  unit: string | null;
  raw_data: Record<string, unknown>;
  recorded_at: string;
  created_at: string;
}

export interface IoTSensorAlert {
  id: string;
  sensor_id: string;
  alert_type: string;
  message: string;
  severity: string;
  reading_value: number | null;
  threshold_value: number | null;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface CreateSensorPayload {
  name: string;
  sensor_type: string;
  device_id: string;
  description?: string;
  location_lat?: number;
  location_lng?: number;
  location_label?: string;
  alert_thresholds?: Record<string, { min?: number; max?: number }>;
}

export function useIoTSensors() {
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [readings, setReadings] = useState<IoTSensorReading[]>([]);
  const [alerts, setAlerts] = useState<IoTSensorAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSensors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('iot_sensors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSensors((data || []) as unknown as IoTSensor[]);
    } catch (error) {
      console.error('Error fetching sensors:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load sensors' });
    }
  }, [toast]);

  const fetchReadings = useCallback(async (sensorId?: string, limit = 100) => {
    try {
      let query = supabase
        .from('iot_sensor_readings')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(limit);

      if (sensorId) {
        query = query.eq('sensor_id', sensorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReadings((data || []) as unknown as IoTSensorReading[]);
    } catch (error) {
      console.error('Error fetching readings:', error);
    }
  }, []);

  const fetchAlerts = useCallback(async (unacknowledgedOnly = false) => {
    try {
      let query = supabase
        .from('iot_sensor_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (unacknowledgedOnly) {
        query = query.is('acknowledged_at', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAlerts((data || []) as unknown as IoTSensorAlert[]);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, []);

  const createSensor = useCallback(async (payload: CreateSensorPayload) => {
    try {
      const { data, error } = await supabase
        .from('iot_sensors')
        .insert({
          name: payload.name,
          sensor_type: payload.sensor_type,
          device_id: payload.device_id,
          description: payload.description || null,
          location_lat: payload.location_lat ?? null,
          location_lng: payload.location_lng ?? null,
          location_label: payload.location_label || null,
          alert_thresholds: payload.alert_thresholds || {},
        })
        .select()
        .single();

      if (error) throw error;
      toast({ title: 'Success', description: 'Sensor added successfully' });
      await fetchSensors();
      return data as unknown as IoTSensor;
    } catch (error: any) {
      console.error('Error creating sensor:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to create sensor' });
      return null;
    }
  }, [toast, fetchSensors]);

  const updateSensor = useCallback(async (id: string, updates: Record<string, unknown>) => {
    try {
      const { error } = await supabase
        .from('iot_sensors')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Sensor updated' });
      await fetchSensors();
    } catch (error: any) {
      console.error('Error updating sensor:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to update sensor' });
    }
  }, [toast, fetchSensors]);

  const deleteSensor = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('iot_sensors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Sensor deleted' });
      await fetchSensors();
    } catch (error: any) {
      console.error('Error deleting sensor:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete sensor' });
    }
  }, [toast, fetchSensors]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('iot_sensor_alerts')
        .update({
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: userData.user?.id || null,
        })
        .eq('id', alertId);

      if (error) throw error;
      toast({ title: 'Alert acknowledged' });
      await fetchAlerts();
    } catch (error: any) {
      console.error('Error acknowledging alert:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to acknowledge alert' });
    }
  }, [toast, fetchAlerts]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchSensors(), fetchReadings(), fetchAlerts(true)]);
      setLoading(false);
    };
    loadAll();
  }, [fetchSensors, fetchReadings, fetchAlerts]);

  return {
    sensors,
    readings,
    alerts,
    loading,
    fetchSensors,
    fetchReadings,
    fetchAlerts,
    createSensor,
    updateSensor,
    deleteSensor,
    acknowledgeAlert,
  };
}
