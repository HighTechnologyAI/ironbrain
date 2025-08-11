-- PRO Strategic Objectives schema
-- 1) Enums
DO $$ BEGIN
  CREATE TYPE public.objective_status AS ENUM ('planned','active','done','on_hold');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.kr_status AS ENUM ('on_track','at_risk','off_track','done');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.vip_status AS ENUM ('invited','confirmed','declined','attended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.risk_severity AS ENUM ('low','medium','high','critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.risk_likelihood AS ENUM ('rare','unlikely','possible','likely','almost_certain');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.media_status AS ENUM ('planned','published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.milestone_status AS ENUM ('planned','in_progress','done');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Tables
CREATE TABLE IF NOT EXISTS public.objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  location TEXT,
  budget_planned NUMERIC,
  strategic_importance TEXT,
  status public.objective_status NOT NULL DEFAULT 'planned',
  company_id UUID NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  progress INTEGER NOT NULL DEFAULT 0,
  target_value NUMERIC,
  current_value NUMERIC,
  unit TEXT,
  owner_id UUID REFERENCES public.profiles(id),
  status public.kr_status NOT NULL DEFAULT 'on_track',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.task_kr_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  kr_id UUID NOT NULL REFERENCES public.key_results(id) ON DELETE CASCADE,
  weight INTEGER NOT NULL DEFAULT 1,
  rationale TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (task_id, kr_id)
);

CREATE TABLE IF NOT EXISTS public.vip_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  organization TEXT,
  country TEXT,
  status public.vip_status NOT NULL DEFAULT 'invited',
  contact TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.media_hits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  outlet TEXT,
  url TEXT,
  reach INTEGER NOT NULL DEFAULT 0,
  published_at DATE,
  status public.media_status NOT NULL DEFAULT 'planned',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  mitigation TEXT,
  owner_id UUID REFERENCES public.profiles(id),
  severity public.risk_severity NOT NULL DEFAULT 'medium',
  likelihood public.risk_likelihood NOT NULL DEFAULT 'possible',
  status TEXT NOT NULL DEFAULT 'open',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.budget_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  category TEXT,
  planned_amount NUMERIC NOT NULL DEFAULT 0,
  actual_amount NUMERIC NOT NULL DEFAULT 0,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date DATE,
  status public.milestone_status NOT NULL DEFAULT 'planned',
  progress INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) Indexes
CREATE INDEX IF NOT EXISTS idx_key_results_objective_id ON public.key_results(objective_id);
CREATE INDEX IF NOT EXISTS idx_task_kr_links_task_id ON public.task_kr_links(task_id);
CREATE INDEX IF NOT EXISTS idx_task_kr_links_kr_id ON public.task_kr_links(kr_id);
CREATE INDEX IF NOT EXISTS idx_vip_guests_objective_id ON public.vip_guests(objective_id);
CREATE INDEX IF NOT EXISTS idx_media_hits_objective_id ON public.media_hits(objective_id);
CREATE INDEX IF NOT EXISTS idx_risks_objective_id ON public.risks(objective_id);
CREATE INDEX IF NOT EXISTS idx_budget_entries_objective_id ON public.budget_entries(objective_id);
CREATE INDEX IF NOT EXISTS idx_milestones_objective_id ON public.milestones(objective_id);

-- 4) Triggers for updated_at
DO $$ BEGIN
  CREATE TRIGGER update_objectives_updated_at
  BEFORE UPDATE ON public.objectives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_key_results_updated_at
  BEFORE UPDATE ON public.key_results
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_vip_guests_updated_at
  BEFORE UPDATE ON public.vip_guests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_media_hits_updated_at
  BEFORE UPDATE ON public.media_hits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_risks_updated_at
  BEFORE UPDATE ON public.risks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_budget_entries_updated_at
  BEFORE UPDATE ON public.budget_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5) RLS policies
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_kr_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_hits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Objectives policies
DO $$ BEGIN
  CREATE POLICY "Authenticated users can view objectives"
  ON public.objectives FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert objectives"
  ON public.objectives FOR INSERT
  WITH CHECK (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their objectives"
  ON public.objectives FOR UPDATE
  USING (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update any objectives"
  ON public.objectives FOR UPDATE
  USING ((public.get_current_user_profile()).role = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete objectives"
  ON public.objectives FOR DELETE
  USING ((public.get_current_user_profile()).role = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Key results policies
DO $$ BEGIN
  CREATE POLICY "Authenticated users can view key results"
  ON public.key_results FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert key results"
  ON public.key_results FOR INSERT
  WITH CHECK (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their key results"
  ON public.key_results FOR UPDATE
  USING (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update any key results"
  ON public.key_results FOR UPDATE
  USING ((public.get_current_user_profile()).role = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete key results"
  ON public.key_results FOR DELETE
  USING ((public.get_current_user_profile()).role = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Task-KR links policies
DO $$ BEGIN
  CREATE POLICY "Authenticated users can view task_kr_links"
  ON public.task_kr_links FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert task_kr_links"
  ON public.task_kr_links FOR INSERT
  WITH CHECK (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their task_kr_links"
  ON public.task_kr_links FOR UPDATE
  USING (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete task_kr_links"
  ON public.task_kr_links FOR DELETE
  USING ((public.get_current_user_profile()).role = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- VIP policies
DO $$ BEGIN
  CREATE POLICY "Authenticated users can view vip_guests"
  ON public.vip_guests FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert vip_guests"
  ON public.vip_guests FOR INSERT
  WITH CHECK (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their vip_guests"
  ON public.vip_guests FOR UPDATE
  USING (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete vip_guests"
  ON public.vip_guests FOR DELETE
  USING ((public.get_current_user_profile()).role = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Media policies
DO $$ BEGIN
  CREATE POLICY "Authenticated users can view media_hits"
  ON public.media_hits FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert media_hits"
  ON public.media_hits FOR INSERT
  WITH CHECK (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their media_hits"
  ON public.media_hits FOR UPDATE
  USING (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete media_hits"
  ON public.media_hits FOR DELETE
  USING ((public.get_current_user_profile()).role = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Risks policies
DO $$ BEGIN
  CREATE POLICY "Authenticated users can view risks"
  ON public.risks FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert risks"
  ON public.risks FOR INSERT
  WITH CHECK (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their risks"
  ON public.risks FOR UPDATE
  USING (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete risks"
  ON public.risks FOR DELETE
  USING ((public.get_current_user_profile()).role = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Budget entries policies
DO $$ BEGIN
  CREATE POLICY "Authenticated users can view budget_entries"
  ON public.budget_entries FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert budget_entries"
  ON public.budget_entries FOR INSERT
  WITH CHECK (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their budget_entries"
  ON public.budget_entries FOR UPDATE
  USING (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete budget_entries"
  ON public.budget_entries FOR DELETE
  USING ((public.get_current_user_profile()).role = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Milestones policies
DO $$ BEGIN
  CREATE POLICY "Authenticated users can view milestones"
  ON public.milestones FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert milestones"
  ON public.milestones FOR INSERT
  WITH CHECK (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their milestones"
  ON public.milestones FOR UPDATE
  USING (created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete milestones"
  ON public.milestones FOR DELETE
  USING ((public.get_current_user_profile()).role = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;