-- Create UAV operations tables

-- UAV Drones table
CREATE TABLE IF NOT EXISTS public.uav_drones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  serial TEXT UNIQUE NOT NULL,
  model TEXT,
  firmware TEXT,
  status TEXT DEFAULT 'offline',
  battery_level DECIMAL(5,2),
  last_contact TIMESTAMP WITH TIME ZONE,
  location_lat DECIMAL(10, 8),
  location_lon DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- UAV Telemetry table
CREATE TABLE IF NOT EXISTS public.uav_telemetry (
  id BIGSERIAL PRIMARY KEY,
  drone_id TEXT NOT NULL,
  mission_id TEXT,
  ts TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  lat DECIMAL(10, 8) NOT NULL,
  lon DECIMAL(11, 8) NOT NULL,
  alt DECIMAL(8, 2) NOT NULL,
  battery_v DECIMAL(4, 2),
  esc_temp_c DECIMAL(5, 2),
  speed_ms DECIMAL(6, 2),
  wind_ms DECIMAL(6, 2),
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- UAV Events/Logs table
CREATE TABLE IF NOT EXISTS public.uav_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drone_id TEXT,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info',
  message TEXT NOT NULL,
  data JSONB,
  ts TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.uav_drones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uav_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uav_events ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can view drones" 
ON public.uav_drones 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can manage drones" 
ON public.uav_drones 
FOR ALL
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view telemetry" 
ON public.uav_telemetry 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert telemetry" 
ON public.uav_telemetry 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can view events" 
ON public.uav_events 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert events" 
ON public.uav_events 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_uav_drones_status ON public.uav_drones(status);
CREATE INDEX IF NOT EXISTS idx_uav_drones_serial ON public.uav_drones(serial);
CREATE INDEX IF NOT EXISTS idx_uav_telemetry_drone_id ON public.uav_telemetry(drone_id);
CREATE INDEX IF NOT EXISTS idx_uav_telemetry_ts ON public.uav_telemetry(ts DESC);
CREATE INDEX IF NOT EXISTS idx_uav_events_drone_id ON public.uav_events(drone_id);
CREATE INDEX IF NOT EXISTS idx_uav_events_ts ON public.uav_events(ts DESC);
CREATE INDEX IF NOT EXISTS idx_uav_events_severity ON public.uav_events(severity);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_uav_drones_updated_at
  BEFORE UPDATE ON public.uav_drones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for demonstration
INSERT INTO public.uav_drones (name, serial, model, firmware, status, battery_level, last_contact, location_lat, location_lon) VALUES
('Eagle-1', 'DRN-001', 'Quadcopter X4', 'v2.1.5', 'online', 87.5, now() - interval '2 minutes', 42.6977, 23.3219),
('Falcon-2', 'DRN-002', 'Hexacopter H6', 'v2.1.3', 'offline', 45.2, now() - interval '1 hour', 42.7077, 23.3319),
('Hawk-3', 'DRN-003', 'Octocopter O8', 'v2.2.0', 'armed', 92.1, now() - interval '30 seconds', 42.7177, 23.3419);

-- Insert sample telemetry data
INSERT INTO public.uav_telemetry (drone_id, lat, lon, alt, battery_v, esc_temp_c, speed_ms, wind_ms, payload) VALUES
('DRN-001', 42.6977, 23.3219, 120.5, 14.8, 65.2, 8.5, 3.2, '{"gps_quality": 9, "satellites": 12}'),
('DRN-001', 42.6980, 23.3225, 118.2, 14.7, 66.1, 7.8, 3.5, '{"gps_quality": 8, "satellites": 11}'),
('DRN-003', 42.7177, 23.3419, 95.8, 15.1, 58.9, 5.2, 2.8, '{"gps_quality": 10, "satellites": 14}');

-- Insert sample events
INSERT INTO public.uav_events (drone_id, event_type, severity, message, data) VALUES
('DRN-001', 'system', 'info', 'Drone connected successfully', '{"connection_type": "wifi", "signal_strength": -45}'),
('DRN-002', 'battery', 'warning', 'Low battery level detected', '{"battery_level": 45.2, "estimated_flight_time": "8 minutes"}'),
('DRN-003', 'mission', 'info', 'Mission waypoint reached', '{"waypoint_id": 2, "mission_progress": 0.65}'),
('DRN-001', 'telemetry', 'error', 'GPS signal temporarily lost', '{"last_known_position": {"lat": 42.6977, "lon": 23.3219}}');