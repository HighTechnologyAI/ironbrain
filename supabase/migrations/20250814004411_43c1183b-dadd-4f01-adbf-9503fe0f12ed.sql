-- UAV Operations Center Database Schema (idempotent, non-destructive)

-- Drones registry
CREATE TABLE IF NOT EXISTS public.uav_drones(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  serial text UNIQUE,
  model text,
  firmware text,
  last_contact timestamptz,
  status text DEFAULT 'offline',
  location_lat double precision,
  location_lon double precision,
  battery_level double precision,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Missions
CREATE TABLE IF NOT EXISTS public.uav_missions(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drone_id uuid REFERENCES public.uav_drones(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'planned',
  started_at timestamptz,
  ended_at timestamptz,
  flight_path jsonb,
  waypoints jsonb,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Telemetry (append-only, high-frequency data)
CREATE TABLE IF NOT EXISTS public.uav_telemetry(
  id bigserial PRIMARY KEY,
  drone_id uuid NOT NULL,
  mission_id uuid REFERENCES public.uav_missions(id) ON DELETE SET NULL,
  ts timestamptz DEFAULT now(),
  lat double precision,
  lon double precision,
  alt double precision,
  battery_v double precision,
  esc_temp_c double precision,
  speed_ms double precision,
  wind_ms double precision,
  payload jsonb
);

-- Events / Alerts
CREATE TABLE IF NOT EXISTS public.uav_events(
  id bigserial PRIMARY KEY,
  drone_id uuid,
  mission_id uuid REFERENCES public.uav_missions(id) ON DELETE SET NULL,
  ts timestamptz DEFAULT now(),
  severity text DEFAULT 'info',
  event_type text NOT NULL,
  message text,
  data jsonb,
  acknowledged boolean DEFAULT false,
  acknowledged_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at timestamptz
);

-- Commands queue (for safe UAV control)
CREATE TABLE IF NOT EXISTS public.uav_commands(
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  drone_id uuid REFERENCES public.uav_drones(id) ON DELETE CASCADE,
  command_type text NOT NULL,
  parameters jsonb,
  status text DEFAULT 'queued',
  confirmation_required boolean DEFAULT false,
  confirmed_at timestamptz,
  executed_at timestamptz,
  result jsonb,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_uav_telemetry_drone_ts ON public.uav_telemetry(drone_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_uav_telemetry_mission_ts ON public.uav_telemetry(mission_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_uav_events_ts ON public.uav_events(ts DESC);
CREATE INDEX IF NOT EXISTS idx_uav_events_severity ON public.uav_events(severity, ts DESC);
CREATE INDEX IF NOT EXISTS idx_uav_commands_user_status ON public.uav_commands(user_id, status);
CREATE INDEX IF NOT EXISTS idx_uav_commands_drone_status ON public.uav_commands(drone_id, status);

-- Enable Row Level Security
ALTER TABLE public.uav_drones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uav_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uav_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uav_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uav_commands ENABLE ROW LEVEL SECURITY;

-- RLS Policies for UAV Drones
CREATE POLICY "Authenticated users can view drones" ON public.uav_drones
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create drones" ON public.uav_drones
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update drones they created" ON public.uav_drones
  FOR UPDATE USING (created_by = auth.uid());

-- RLS Policies for UAV Missions
CREATE POLICY "Authenticated users can view missions" ON public.uav_missions
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create missions" ON public.uav_missions
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update missions they created" ON public.uav_missions
  FOR UPDATE USING (created_by = auth.uid());

-- RLS Policies for Telemetry (read-only for users)
CREATE POLICY "Authenticated users can view telemetry" ON public.uav_telemetry
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for Events
CREATE POLICY "Authenticated users can view events" ON public.uav_events
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can acknowledge events" ON public.uav_events
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for Commands
CREATE POLICY "Users can view their own commands" ON public.uav_commands
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create commands" ON public.uav_commands
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own commands" ON public.uav_commands
  FOR UPDATE USING (user_id = auth.uid());

-- Add locale column to profiles if it doesn't exist
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS locale text
  CHECK (locale IN ('ru','bg','en'));

-- Set default locale to 'ru' for existing users
UPDATE public.profiles SET locale = 'ru' WHERE locale IS NULL;

-- Enable realtime for UAV tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.uav_drones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.uav_missions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.uav_telemetry;
ALTER PUBLICATION supabase_realtime ADD TABLE public.uav_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.uav_commands;