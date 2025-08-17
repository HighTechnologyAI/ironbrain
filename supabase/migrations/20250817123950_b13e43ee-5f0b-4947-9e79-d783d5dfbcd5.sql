-- Phase 4: Database Normalization - mission waypoints and update policies

-- 1) Create mission_waypoints table (normalized mission route data)
CREATE TABLE IF NOT EXISTS public.mission_waypoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
  mission_id UUID NOT NULL REFERENCES public.missions_extended(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,  
  alt_meters INTEGER NOT NULL DEFAULT 0,
  action TEXT NOT NULL DEFAULT 'waypoint', -- takeoff | waypoint | hover | land
  hold_time_seconds INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_mission_waypoints_sequence UNIQUE (mission_id, sequence_number)
);

-- 2) Enable RLS
ALTER TABLE public.mission_waypoints ENABLE ROW LEVEL SECURITY;

-- 3) Add policies for org-scoped access to mission waypoints
CREATE POLICY "Users can view org mission waypoints"
ON public.mission_waypoints
FOR SELECT  
USING (
  mission_id IN (
    SELECT me.id FROM public.missions_extended me
    WHERE me.org_id = public.get_current_user_org_id()
  )
);

CREATE POLICY "Users can insert org mission waypoints"
ON public.mission_waypoints
FOR INSERT
WITH CHECK (
  mission_id IN (
    SELECT me.id FROM public.missions_extended me 
    WHERE me.org_id = public.get_current_user_org_id()
  )
);

CREATE POLICY "Users can update org mission waypoints"  
ON public.mission_waypoints
FOR UPDATE
USING (
  mission_id IN (
    SELECT me.id FROM public.missions_extended me
    WHERE me.org_id = public.get_current_user_org_id()
  )
);

CREATE POLICY "Users can delete org mission waypoints"
ON public.mission_waypoints
FOR DELETE
USING (
  mission_id IN (
    SELECT me.id FROM public.missions_extended me
    WHERE me.org_id = public.get_current_user_org_id()
  )
);

-- 4) Add triggers for auto-updating timestamps
CREATE TRIGGER update_mission_waypoints_updated_at
BEFORE UPDATE ON public.mission_waypoints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_missions_extended_updated_at
BEFORE UPDATE ON public.missions_extended  
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Add UPDATE policy for missions_extended
CREATE POLICY "Users can update org missions"
ON public.missions_extended
FOR UPDATE
USING (org_id = public.get_current_user_org_id());

-- 6) Add indexes for performance
CREATE INDEX idx_mission_waypoints_mission_id ON public.mission_waypoints(mission_id);
CREATE INDEX idx_mission_waypoints_mission_seq ON public.mission_waypoints(mission_id, sequence_number);