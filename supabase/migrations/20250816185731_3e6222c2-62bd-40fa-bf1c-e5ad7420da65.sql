-- Fix critical RLS security issues
-- Enable RLS on tables that have policies but RLS is disabled

-- Enable RLS on drone ecosystem tables
ALTER TABLE public.drones_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions_extended ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.mission_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_clearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kv_config ENABLE ROW LEVEL SECURITY;

-- Add missing RLS policies for core tables
CREATE POLICY "Users can view system config" ON public.kv_config
  FOR SELECT USING (true);

CREATE POLICY "Only system can modify config" ON public.kv_config
  FOR ALL USING (false);

-- Add RLS policies for models table
CREATE POLICY "Users can view approved models" ON public.models
  FOR SELECT USING (approved_at IS NOT NULL);

CREATE POLICY "System can manage models" ON public.models
  FOR ALL USING (false);

-- Add RLS policies for partner clearances  
CREATE POLICY "Users can view org clearances" ON public.partner_clearances
  FOR SELECT USING (org_id = get_current_user_org_id());

-- Add RLS policies for mission assignments
CREATE POLICY "Users can view org assignments" ON public.mission_assignments
  FOR SELECT USING (
    mission_id IN (
      SELECT id FROM missions_extended 
      WHERE org_id = get_current_user_org_id()
    )
  );

CREATE POLICY "Users can create org assignments" ON public.mission_assignments
  FOR INSERT WITH CHECK (
    mission_id IN (
      SELECT id FROM missions_extended 
      WHERE org_id = get_current_user_org_id()
    )
  );