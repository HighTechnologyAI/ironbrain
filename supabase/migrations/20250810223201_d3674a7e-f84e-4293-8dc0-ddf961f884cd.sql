-- Create task_translations table and RLS policies (idempotent)
CREATE TABLE IF NOT EXISTS public.task_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT task_translations_unique_lang UNIQUE (task_id, language)
);

CREATE INDEX IF NOT EXISTS idx_task_translations_task ON public.task_translations(task_id);
CREATE INDEX IF NOT EXISTS idx_task_translations_lang ON public.task_translations(language);

ALTER TABLE public.task_translations ENABLE ROW LEVEL SECURITY;

-- Recreate policies safely
DROP POLICY IF EXISTS "Users can view translations for accessible tasks" ON public.task_translations;
DROP POLICY IF EXISTS "Users can insert translations for their tasks" ON public.task_translations;
DROP POLICY IF EXISTS "Users can update translations for their tasks" ON public.task_translations;

CREATE POLICY "Users can view translations for accessible tasks"
ON public.task_translations
FOR SELECT
USING (
  task_id IN (
    SELECT t.id FROM public.tasks t
    WHERE (
      t.assigned_to IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
      OR t.created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
    )
  )
  OR task_id IN (
    SELECT tp.task_id FROM public.task_participants tp
    WHERE tp.user_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
  )
);

CREATE POLICY "Users can insert translations for their tasks"
ON public.task_translations
FOR INSERT
WITH CHECK (
  task_id IN (
    SELECT t.id FROM public.tasks t
    WHERE (
      t.assigned_to IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
      OR t.created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
    )
  )
  OR task_id IN (
    SELECT tp.task_id FROM public.task_participants tp
    WHERE tp.user_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
  )
);

CREATE POLICY "Users can update translations for their tasks"
ON public.task_translations
FOR UPDATE
USING (
  task_id IN (
    SELECT t.id FROM public.tasks t
    WHERE (
      t.assigned_to IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
      OR t.created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
    )
  )
  OR task_id IN (
    SELECT tp.task_id FROM public.task_participants tp
    WHERE tp.user_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
  )
)
WITH CHECK (
  task_id IN (
    SELECT t.id FROM public.tasks t
    WHERE (
      t.assigned_to IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
      OR t.created_by IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
    )
  )
  OR task_id IN (
    SELECT tp.task_id FROM public.task_participants tp
    WHERE tp.user_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid())
  )
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_task_translations_updated_at ON public.task_translations;
CREATE TRIGGER update_task_translations_updated_at
BEFORE UPDATE ON public.task_translations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();