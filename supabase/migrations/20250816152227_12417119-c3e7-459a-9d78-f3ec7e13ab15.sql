-- TIGER TECH PHASE 1: Core Infrastructure Schema
-- Organizations and Users
CREATE TABLE public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.users_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'operator',
  mfa_enabled BOOLEAN DEFAULT false,
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Drones
CREATE TABLE public.drones_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  hw_rev TEXT,
  fw_rev TEXT,
  jetson_serial TEXT UNIQUE,
  public_key_fingerprint TEXT,
  status TEXT DEFAULT 'offline',
  last_heartbeat_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Missions
CREATE TABLE public.missions_extended (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'planning',
  created_by UUID REFERENCES public.users_extended(id),
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  geo_fence JSONB,
  ruleset JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mission Assignments
CREATE TABLE public.mission_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES public.missions_extended(id) ON DELETE CASCADE,
  drone_id UUID REFERENCES public.drones_extended(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'primary',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(mission_id, drone_id)
);

-- Telemetry (partitioned by month)
CREATE TABLE public.telemetry (
  id UUID DEFAULT gen_random_uuid(),
  drone_id UUID REFERENCES public.drones_extended(id) ON DELETE CASCADE,
  ts TIMESTAMP WITH TIME ZONE DEFAULT now(),
  lat DECIMAL(10, 8),
  lon DECIMAL(11, 8),
  alt DECIMAL(8, 2),
  vel DECIMAL(6, 2),
  hdg DECIMAL(5, 2),
  batt_v DECIMAL(4, 2),
  temp DECIMAL(4, 1),
  health JSONB,
  payload_state JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id, ts)
) PARTITION BY RANGE (ts);

-- Events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drone_id UUID REFERENCES public.drones_extended(id) ON DELETE CASCADE,
  ts TIMESTAMP WITH TIME ZONE DEFAULT now(),
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Video Segments
CREATE TABLE public.video_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drone_id UUID REFERENCES public.drones_extended(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES public.missions_extended(id) ON DELETE SET NULL,
  ts_start TIMESTAMP WITH TIME ZONE NOT NULL,
  ts_end TIMESTAMP WITH TIME ZONE NOT NULL,
  storage_path TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  media_type TEXT DEFAULT 'video/mp4',
  codec TEXT DEFAULT 'h264',
  size_bytes BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Detections
CREATE TABLE public.detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_segment_id UUID REFERENCES public.video_segments(id) ON DELETE CASCADE,
  ts TIMESTAMP WITH TIME ZONE NOT NULL,
  class TEXT NOT NULL,
  score DECIMAL(3, 2),
  bbox JSONB,
  tracking_id TEXT,
  model_version TEXT,
  geo JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Models Registry
CREATE TABLE public.models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  task TEXT NOT NULL,
  version TEXT NOT NULL,
  sha256 TEXT NOT NULL UNIQUE,
  metrics JSONB,
  source TEXT,
  approved_by UUID REFERENCES public.users_extended(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(name, version)
);

-- Partner Clearances
CREATE TABLE public.partner_clearances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  partner TEXT NOT NULL,
  scope JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_type TEXT DEFAULT 'user',
  ts TIMESTAMP WITH TIME ZONE DEFAULT now(),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  before_state JSONB,
  after_state JSONB,
  ip INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Key-Value Config
CREATE TABLE public.kv_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL,
  key TEXT NOT NULL,
  value_json JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(scope, key)
);

-- Enable RLS on all tables
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drones_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_clearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kv_config ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's org
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM public.users_extended WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- RLS Policies
-- Orgs: users can only see their own org
CREATE POLICY "Users can view their org" ON public.orgs
  FOR SELECT USING (id = public.get_current_user_org_id());

-- Users: can view users in same org
CREATE POLICY "Users can view org members" ON public.users_extended
  FOR SELECT USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can update their own profile" ON public.users_extended
  FOR UPDATE USING (user_id = auth.uid());

-- Drones: org-scoped
CREATE POLICY "Users can view org drones" ON public.drones_extended
  FOR SELECT USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can insert org drones" ON public.drones_extended
  FOR INSERT WITH CHECK (org_id = public.get_current_user_org_id());

-- Missions: org-scoped
CREATE POLICY "Users can view org missions" ON public.missions_extended
  FOR SELECT USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Users can create org missions" ON public.missions_extended
  FOR INSERT WITH CHECK (org_id = public.get_current_user_org_id());

-- Telemetry: org-scoped via drone
CREATE POLICY "Users can view org telemetry" ON public.telemetry
  FOR SELECT USING (
    drone_id IN (
      SELECT id FROM public.drones_extended 
      WHERE org_id = public.get_current_user_org_id()
    )
  );

-- Events: org-scoped via drone
CREATE POLICY "Users can view org events" ON public.events
  FOR SELECT USING (
    drone_id IN (
      SELECT id FROM public.drones_extended 
      WHERE org_id = public.get_current_user_org_id()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_telemetry_drone_ts ON public.telemetry (drone_id, ts);
CREATE INDEX idx_events_drone_ts ON public.events (drone_id, ts);
CREATE INDEX idx_events_payload_gin ON public.events USING GIN (payload);
CREATE INDEX idx_detections_video_segment ON public.detections (video_segment_id);
CREATE INDEX idx_video_segments_drone_mission ON public.video_segments (drone_id, mission_id);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_orgs_updated_at
  BEFORE UPDATE ON public.orgs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_extended_updated_at
  BEFORE UPDATE ON public.users_extended
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drones_extended_updated_at
  BEFORE UPDATE ON public.drones_extended
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_missions_extended_updated_at
  BEFORE UPDATE ON public.missions_extended
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed data for demo
INSERT INTO public.orgs (name, tier) VALUES 
  ('TIGER TECH HQ', 'enterprise'),
  ('Demo Organization', 'basic');

-- Note: users_extended will be populated via trigger when users sign up