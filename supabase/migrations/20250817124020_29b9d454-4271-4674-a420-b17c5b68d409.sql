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

-- 3) Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view org mission waypoints" ON public.mission_waypoints;
CREATE POLICY "Users can view org mission waypoints"
ON public.mission_waypoints
FOR SELECT  
USING (
  mission_id IN (
    SELECT me.id FROM public.missions_extended me
    WHERE me.org_id = public.get_current_user_org_id()
  )
);

DROP POLICY IF EXISTS "Users can insert org mission waypoints" ON public.mission_waypoints;
CREATE POLICY "Users can insert org mission waypoints"
ON public.mission_waypoints
FOR INSERT
WITH CHECK (
  mission_id IN (
    SELECT me.id FROM public.missions_extended me 
    WHERE me.org_id = public.get_current_user_org_id()
  )
);

DROP POLICY IF EXISTS "Users can update org mission waypoints" ON public.mission_waypoints;
CREATE POLICY "Users can update org mission waypoints"  
ON public.mission_waypoints
FOR UPDATE
USING (
  mission_id IN (
    SELECT me.id FROM public.missions_extended me
    WHERE me.org_id = public.get_current_user_org_id()
  )
);

DROP POLICY IF EXISTS "Users can delete org mission waypoints" ON public.mission_waypoints;
CREATE POLICY "Users can delete org mission waypoints"
ON public.mission_waypoints
FOR DELETE
USING (
  mission_id IN (
    SELECT me.id FROM public.missions_extended me
    WHERE me.org_id = public.get_current_user_org_id()
  )
);

-- 4) Add triggers for auto-updating timestamps (with IF EXISTS check)
DROP TRIGGER IF EXISTS update_mission_waypoints_updated_at ON public.mission_waypoints;
CREATE TRIGGER update_mission_waypoints_updated_at
BEFORE UPDATE ON public.mission_waypoints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- missions_extended trigger already exists, skip it

-- 5) Add UPDATE policy for missions_extended (if not exists)
DROP POLICY IF EXISTS "Users can update org missions" ON public.missions_extended;
CREATE POLICY "Users can update org missions"
ON public.missions_extended
FOR UPDATE
USING (org_id = public.get_current_user_org_id());

-- 6) Add indexes for performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_mission_waypoints_mission_id ON public.mission_waypoints(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_waypoints_mission_seq ON public.mission_waypoints(mission_id, sequence_number);