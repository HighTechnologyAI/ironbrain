-- Idempotent, safe schema tweak for task chat i18n
-- Adds 'language' column and indexes if missing. Safe to run multiple times.
ALTER TABLE public.task_comments
  ADD COLUMN IF NOT EXISTS language text;

CREATE INDEX IF NOT EXISTS idx_task_comments_language
  ON public.task_comments(language);

CREATE INDEX IF NOT EXISTS idx_task_comments_task_created
  ON public.task_comments(task_id, created_at);

-- Ensure table is in realtime publication (safe if already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;
