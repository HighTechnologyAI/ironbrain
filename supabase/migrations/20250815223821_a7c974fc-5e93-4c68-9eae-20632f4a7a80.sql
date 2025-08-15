-- Create table for drones
CREATE TABLE public.drones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  model text NOT NULL,
  serial_number text NOT NULL UNIQUE,
  manufacturer text NOT NULL DEFAULT 'Tiger Technology',
  status text NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance', 'mission', 'charging')),
  battery_level numeric(5,2) DEFAULT 0 CHECK (battery_level >= 0 AND battery_level <= 100),
  location_latitude numeric(10,7),
  location_longitude numeric(10,7),
  altitude_meters numeric(8,2) DEFAULT 0,
  speed_ms numeric(6,2) DEFAULT 0,
  flight_time_hours numeric(10,2) DEFAULT 0,
  last_maintenance date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true
);

-- Create table for drone telemetry (real-time data)
CREATE TABLE public.drone_telemetry (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drone_id uuid NOT NULL REFERENCES drones(id) ON DELETE CASCADE,
  timestamp timestamp with time zone NOT NULL DEFAULT now(),
  battery_level numeric(5,2) NOT NULL CHECK (battery_level >= 0 AND battery_level <= 100),
  battery_voltage numeric(5,2),
  battery_current numeric(6,2),
  temperature_celsius numeric(5,2),
  humidity_percent numeric(5,2),
  altitude_meters numeric(8,2) NOT NULL DEFAULT 0,
  speed_ms numeric(6,2) NOT NULL DEFAULT 0,
  location_latitude numeric(10,7),
  location_longitude numeric(10,7),
  heading_degrees numeric(5,2) CHECK (heading_degrees >= 0 AND heading_degrees < 360),
  vibration_level numeric(5,2) DEFAULT 0,
  signal_strength numeric(5,2) DEFAULT 0,
  gps_satellites integer DEFAULT 0,
  flight_mode text DEFAULT 'manual',
  armed boolean DEFAULT false,
  errors jsonb DEFAULT '[]'::jsonb,
  raw_data jsonb DEFAULT '{}'::jsonb
);

-- Create indexes for performance
CREATE INDEX idx_drones_status ON drones(status);
CREATE INDEX idx_drones_serial ON drones(serial_number);
CREATE INDEX idx_drone_telemetry_drone_id ON drone_telemetry(drone_id);
CREATE INDEX idx_drone_telemetry_timestamp ON drone_telemetry(timestamp DESC);
CREATE INDEX idx_drone_telemetry_latest ON drone_telemetry(drone_id, timestamp DESC);

-- Create RLS policies for drones
ALTER TABLE public.drones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all drones"
ON public.drones
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage drones"
ON public.drones
FOR ALL
USING ((get_current_user_profile()).role = 'admin'::employee_role);

CREATE POLICY "Users can create drones"
ON public.drones
FOR INSERT
WITH CHECK (created_by IN (
  SELECT p.id FROM profiles p WHERE p.user_id = auth.uid()
));

-- Create RLS policies for telemetry
ALTER TABLE public.drone_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all telemetry"
ON public.drone_telemetry
FOR SELECT
USING (true);

CREATE POLICY "System can insert telemetry"
ON public.drone_telemetry
FOR INSERT
WITH CHECK (true);

-- Create trigger for updating drone status from telemetry
CREATE OR REPLACE FUNCTION update_drone_from_telemetry()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE drones 
  SET 
    battery_level = NEW.battery_level,
    location_latitude = NEW.location_latitude,
    location_longitude = NEW.location_longitude,
    altitude_meters = NEW.altitude_meters,
    speed_ms = NEW.speed_ms,
    status = CASE 
      WHEN NEW.armed = true THEN 'mission'
      WHEN NEW.battery_level <= 20 THEN 'charging'
      WHEN NEW.battery_level > 20 THEN 'online'
      ELSE status
    END,
    updated_at = now()
  WHERE id = NEW.drone_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_drone_from_telemetry
  AFTER INSERT ON drone_telemetry
  FOR EACH ROW
  EXECUTE FUNCTION update_drone_from_telemetry();

-- Insert the real drone
INSERT INTO public.drones (
  name,
  model, 
  serial_number,
  manufacturer,
  status,
  battery_level,
  created_by
) VALUES (
  'BIG BEE v2.4 FireCore',
  'BIG BEE v2.4',
  'UACBB25HEX1',
  'Tiger Technology',
  'offline',
  0,
  (SELECT id FROM profiles WHERE user_id = auth.uid() LIMIT 1)
);

-- Create view for latest drone telemetry
CREATE OR REPLACE VIEW drone_status_view AS
SELECT 
  d.id,
  d.name,
  d.model,
  d.serial_number,
  d.manufacturer,
  d.status,
  d.battery_level,
  d.location_latitude,
  d.location_longitude,
  d.altitude_meters,
  d.speed_ms,
  d.flight_time_hours,
  d.last_maintenance,
  d.created_at,
  d.updated_at,
  d.is_active,
  t.timestamp as last_telemetry,
  t.temperature_celsius,
  t.humidity_percent,
  t.battery_voltage,
  t.battery_current,
  t.heading_degrees,
  t.vibration_level,
  t.signal_strength,
  t.gps_satellites,
  t.flight_mode,
  t.armed,
  t.errors
FROM drones d
LEFT JOIN LATERAL (
  SELECT * 
  FROM drone_telemetry dt 
  WHERE dt.drone_id = d.id 
  ORDER BY dt.timestamp DESC 
  LIMIT 1
) t ON true
WHERE d.is_active = true;