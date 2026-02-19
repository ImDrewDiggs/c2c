import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sensor-api-key',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SensorReading {
  device_id: string;
  readings: {
    type: string;
    value: number;
    unit?: string;
  }[];
  timestamp?: string;
  raw_data?: Record<string, unknown>;
  location?: {
    lat: number;
    lng: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Authenticate via x-sensor-api-key header or apikey in body
    const sensorApiKey = req.headers.get('x-sensor-api-key');
    const body: SensorReading = await req.json();

    if (!body.device_id) {
      return new Response(JSON.stringify({ error: 'device_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate device_id format (alphanumeric, hyphens, underscores, max 128 chars)
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(body.device_id)) {
      return new Response(JSON.stringify({ error: 'Invalid device_id format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Look up sensor by device_id
    const { data: sensor, error: sensorError } = await supabase
      .from('iot_sensors')
      .select('id, api_key, alert_thresholds, status, name')
      .eq('device_id', body.device_id)
      .maybeSingle();

    if (sensorError || !sensor) {
      return new Response(JSON.stringify({ error: 'Sensor not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify API key
    if (sensorApiKey && sensorApiKey !== sensor.api_key) {
      return new Response(JSON.stringify({ error: 'Invalid sensor API key' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (sensor.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Sensor is inactive' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate readings
    if (!body.readings || !Array.isArray(body.readings) || body.readings.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one reading is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (body.readings.length > 50) {
      return new Response(JSON.stringify({ error: 'Maximum 50 readings per request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const recordedAt = body.timestamp ? new Date(body.timestamp).toISOString() : new Date().toISOString();

    // Insert readings
    const readingsToInsert = body.readings.map((r) => ({
      sensor_id: sensor.id,
      reading_type: String(r.type).slice(0, 64),
      value: Number(r.value),
      unit: r.unit ? String(r.unit).slice(0, 32) : null,
      raw_data: body.raw_data || {},
      recorded_at: recordedAt,
    }));

    const { error: insertError } = await supabase
      .from('iot_sensor_readings')
      .insert(readingsToInsert);

    if (insertError) {
      console.error('Insert readings error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to store readings' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update sensor last_reading_at and location if provided
    const sensorUpdate: Record<string, unknown> = {
      last_reading_at: recordedAt,
    };
    if (body.location?.lat != null && body.location?.lng != null) {
      sensorUpdate.location_lat = body.location.lat;
      sensorUpdate.location_lng = body.location.lng;
    }

    await supabase
      .from('iot_sensors')
      .update(sensorUpdate)
      .eq('id', sensor.id);

    // Check thresholds and create alerts
    const thresholds = sensor.alert_thresholds as Record<string, { min?: number; max?: number }> | null;
    if (thresholds && typeof thresholds === 'object') {
      const alertsToInsert: {
        sensor_id: string;
        alert_type: string;
        message: string;
        severity: string;
        reading_value: number;
        threshold_value: number;
      }[] = [];

      for (const reading of body.readings) {
        const threshold = thresholds[reading.type];
        if (!threshold) continue;

        if (threshold.max != null && reading.value > threshold.max) {
          alertsToInsert.push({
            sensor_id: sensor.id,
            alert_type: 'threshold_exceeded',
            message: `${sensor.name}: ${reading.type} reading (${reading.value}${reading.unit || ''}) exceeds maximum threshold (${threshold.max})`,
            severity: 'critical',
            reading_value: reading.value,
            threshold_value: threshold.max,
          });
        }

        if (threshold.min != null && reading.value < threshold.min) {
          alertsToInsert.push({
            sensor_id: sensor.id,
            alert_type: 'threshold_below',
            message: `${sensor.name}: ${reading.type} reading (${reading.value}${reading.unit || ''}) below minimum threshold (${threshold.min})`,
            severity: 'warning',
            reading_value: reading.value,
            threshold_value: threshold.min,
          });
        }
      }

      if (alertsToInsert.length > 0) {
        await supabase.from('iot_sensor_alerts').insert(alertsToInsert);
      }
    }

    return new Response(JSON.stringify({ success: true, readings_stored: readingsToInsert.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
