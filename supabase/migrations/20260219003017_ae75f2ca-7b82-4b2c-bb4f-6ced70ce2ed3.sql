
-- IoT Sensors table
CREATE TABLE public.iot_sensors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sensor_type TEXT NOT NULL DEFAULT 'generic',
  device_id TEXT NOT NULL UNIQUE,
  api_key TEXT NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  description TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  location_label TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  alert_thresholds JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  last_reading_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- IoT Sensor Readings table (time-series data)
CREATE TABLE public.iot_sensor_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id UUID NOT NULL REFERENCES public.iot_sensors(id) ON DELETE CASCADE,
  reading_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  raw_data JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- IoT Sensor Alerts table
CREATE TABLE public.iot_sensor_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sensor_id UUID NOT NULL REFERENCES public.iot_sensors(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  reading_value NUMERIC,
  threshold_value NUMERIC,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_iot_sensor_readings_sensor_id ON public.iot_sensor_readings(sensor_id);
CREATE INDEX idx_iot_sensor_readings_recorded_at ON public.iot_sensor_readings(recorded_at DESC);
CREATE INDEX idx_iot_sensor_readings_sensor_recorded ON public.iot_sensor_readings(sensor_id, recorded_at DESC);
CREATE INDEX idx_iot_sensor_alerts_sensor_id ON public.iot_sensor_alerts(sensor_id);
CREATE INDEX idx_iot_sensor_alerts_created_at ON public.iot_sensor_alerts(created_at DESC);
CREATE INDEX idx_iot_sensors_device_id ON public.iot_sensors(device_id);
CREATE INDEX idx_iot_sensors_status ON public.iot_sensors(status);

-- Enable RLS
ALTER TABLE public.iot_sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_sensor_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for iot_sensors (admin-only management)
CREATE POLICY "Admins can manage all sensors" ON public.iot_sensors
  FOR ALL USING (is_admin_user());

CREATE POLICY "Admins can view all sensors" ON public.iot_sensors
  FOR SELECT USING (is_admin_user());

-- RLS Policies for iot_sensor_readings
CREATE POLICY "Admins can view all readings" ON public.iot_sensor_readings
  FOR SELECT USING (is_admin_user());

CREATE POLICY "System can insert readings" ON public.iot_sensor_readings
  FOR INSERT WITH CHECK (true);

-- RLS Policies for iot_sensor_alerts
CREATE POLICY "Admins can manage alerts" ON public.iot_sensor_alerts
  FOR ALL USING (is_admin_user());

CREATE POLICY "Admins can view alerts" ON public.iot_sensor_alerts
  FOR SELECT USING (is_admin_user());

CREATE POLICY "System can insert alerts" ON public.iot_sensor_alerts
  FOR INSERT WITH CHECK (true);

-- Updated_at trigger for sensors
CREATE TRIGGER update_iot_sensors_updated_at
  BEFORE UPDATE ON public.iot_sensors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
