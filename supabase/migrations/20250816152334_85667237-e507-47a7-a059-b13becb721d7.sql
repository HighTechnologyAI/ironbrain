-- Fix security issues from PHASE 1 migration

-- Fix missing RLS policies for tables without any policies
CREATE POLICY "Users can view mission assignments for org missions" ON public.mission_assignments
  FOR SELECT USING (
    mission_id IN (
      SELECT id FROM public.missions_extended 
      WHERE org_id = public.get_current_user_org_id()
    )
  );

CREATE POLICY "Users can manage mission assignments for org missions" ON public.mission_assignments
  FOR INSERT WITH CHECK (
    mission_id IN (
      SELECT id FROM public.missions_extended 
      WHERE org_id = public.get_current_user_org_id()
    )
  );

CREATE POLICY "Users can view org video segments" ON public.video_segments
  FOR SELECT USING (
    drone_id IN (
      SELECT id FROM public.drones_extended 
      WHERE org_id = public.get_current_user_org_id()
    )
  );

CREATE POLICY "System can insert video segments" ON public.video_segments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view org detections" ON public.detections
  FOR SELECT USING (
    video_segment_id IN (
      SELECT vs.id FROM public.video_segments vs
      JOIN public.drones_extended d ON vs.drone_id = d.id
      WHERE d.org_id = public.get_current_user_org_id()
    )
  );

CREATE POLICY "System can insert detections" ON public.detections
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view approved models" ON public.models
  FOR SELECT USING (approved_at IS NOT NULL);

CREATE POLICY "Users can view org partner clearances" ON public.partner_clearances
  FOR SELECT USING (org_id = public.get_current_user_org_id());

CREATE POLICY "Admins can insert partner clearances" ON public.partner_clearances
  FOR INSERT WITH CHECK (org_id = public.get_current_user_org_id());

CREATE POLICY "System can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    actor_id IN (
      SELECT id FROM public.users_extended 
      WHERE org_id = public.get_current_user_org_id() AND role IN ('admin', 'supervisor')
    )
  );

CREATE POLICY "Admins can manage config" ON public.kv_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users_extended 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Fix search path for functions
DROP FUNCTION IF EXISTS public.get_current_user_org_id();

CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS UUID 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.users_extended WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Update existing functions to have proper search path
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Add telemetry partition for current month
CREATE TABLE public.telemetry_2025_01 PARTITION OF public.telemetry
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Add some basic insert policies for telemetry and events (for system/device access)
CREATE POLICY "System can insert telemetry" ON public.telemetry
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can insert events" ON public.events
  FOR INSERT WITH CHECK (true);