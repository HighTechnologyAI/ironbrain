-- Create telemetry table for real-time drone data
CREATE TABLE public.uav_telemetry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drone_id UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  altitude_meters REAL,
  speed_mps REAL,
  heading REAL,
  battery_voltage REAL,
  battery_percentage REAL,
  signal_strength INTEGER,
  temperature REAL,
  humidity REAL,
  pressure REAL,
  gps_satellites INTEGER,
  flight_mode TEXT,
  armed BOOLEAN DEFAULT false,
  vibration_x REAL,
  vibration_y REAL,
  vibration_z REAL,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create telemetry index for performance
CREATE INDEX idx_uav_telemetry_drone_id_timestamp ON public.uav_telemetry(drone_id, timestamp DESC);
CREATE INDEX idx_uav_telemetry_timestamp ON public.uav_telemetry(timestamp DESC);

-- Enable RLS on telemetry
ALTER TABLE public.uav_telemetry ENABLE ROW LEVEL SECURITY;

-- Create policies for telemetry
CREATE POLICY "Users can view all telemetry data" 
ON public.uav_telemetry 
FOR SELECT 
USING (true);

CREATE POLICY "System can insert telemetry data" 
ON public.uav_telemetry 
FOR INSERT 
WITH CHECK (true);

-- Update UAV drones table to add more status fields
ALTER TABLE public.uav_drones 
ADD COLUMN IF NOT EXISTS flight_hours REAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_flights INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS maintenance_due_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_maintenance TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS home_latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS home_longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS max_flight_time_minutes INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS max_range_km REAL DEFAULT 10;

-- Create mission logs table for tracking mission events
CREATE TABLE public.mission_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL,
  drone_id UUID,
  event_type TEXT NOT NULL,
  event_message TEXT NOT NULL,
  event_data JSONB,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mission logs index
CREATE INDEX idx_mission_logs_mission_id ON public.mission_logs(mission_id, created_at DESC);
CREATE INDEX idx_mission_logs_drone_id ON public.mission_logs(drone_id, created_at DESC);

-- Enable RLS on mission logs
ALTER TABLE public.mission_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for mission logs
CREATE POLICY "Users can view all mission logs" 
ON public.mission_logs 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create mission logs" 
ON public.mission_logs 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create waypoints table for mission planning
CREATE TABLE public.mission_waypoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL,
  sequence_number INTEGER NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  altitude_meters REAL NOT NULL,
  speed_mps REAL,
  heading REAL,
  action_type TEXT DEFAULT 'waypoint' CHECK (action_type IN ('waypoint', 'takeoff', 'landing', 'hover', 'photo', 'video_start', 'video_stop')),
  action_params JSONB,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create waypoints index
CREATE INDEX idx_mission_waypoints_mission_id ON public.mission_waypoints(mission_id, sequence_number);

-- Enable RLS on waypoints
ALTER TABLE public.mission_waypoints ENABLE ROW LEVEL SECURITY;

-- Create policies for waypoints
CREATE POLICY "Users can view waypoints for accessible missions" 
ON public.mission_waypoints 
FOR SELECT 
USING (
  mission_id IN (
    SELECT id FROM public.missions 
    WHERE created_by IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can manage waypoints for their missions" 
ON public.mission_waypoints 
FOR ALL 
USING (
  mission_id IN (
    SELECT id FROM public.missions 
    WHERE created_by IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  )
) 
WITH CHECK (
  mission_id IN (
    SELECT id FROM public.missions 
    WHERE created_by IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
  )
);

-- Update existing table to have updated_at trigger
CREATE TRIGGER update_uav_telemetry_updated_at
BEFORE UPDATE ON public.uav_telemetry
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mission_logs_updated_at
BEFORE UPDATE ON public.mission_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mission_waypoints_updated_at
BEFORE UPDATE ON public.mission_waypoints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some demo data for UAV drones if table is empty
INSERT INTO public.uav_drones (
  name, model, serial, status, battery_level, firmware, 
  location_lat, location_lon, flight_hours, total_flights,
  home_latitude, home_longitude, max_flight_time_minutes, max_range_km,
  created_by
) VALUES 
(
  'Phoenix-01', 'DJI Matrice 300 RTK', 'PHX001-2024', 'ready', 85, 'v4.0.12',
  43.3889, 26.8855, 45.5, 28,
  43.3889, 26.8855, 55, 15,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
),
(
  'Eagle-02', 'DJI Matrice 300 RTK', 'EGL002-2024', 'maintenance', 12, 'v4.0.10',
  NULL, NULL, 120.3, 75,
  43.3889, 26.8855, 55, 15,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
),
(
  'Hawk-03', 'Autel EVO II Pro', 'HWK003-2024', 'ready', 92, 'v2.1.4',
  43.3892, 26.8860, 12.8, 8,
  43.3889, 26.8855, 40, 8,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
)
ON CONFLICT DO NOTHING;

-- Insert demo missions
INSERT INTO public.missions (
  name, description, status, drone_id, waypoints, altitude_meters,
  start_time, progress, created_by
) VALUES 
(
  'Патрулирование периметра', 'Регулярное патрулирование периметра аэродрома', 'planning',
  (SELECT id FROM uav_drones WHERE name = 'Phoenix-01' LIMIT 1),
  8, 150, NULL, 0,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
),
(
  'Инспекция инфраструктуры', 'Проверка состояния взлетно-посадочной полосы', 'armed',
  (SELECT id FROM uav_drones WHERE name = 'Hawk-03' LIMIT 1),
  12, 80, now() - INTERVAL '5 minutes', 25,
  (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1)
)
ON CONFLICT DO NOTHING;