-- Safe migration: add 'language' column to task_comments (nullable), plus index for filtering
ALTER TABLE public.task_comments
ADD COLUMN IF NOT EXISTS language text;

CREATE INDEX IF NOT EXISTS idx_task_comments_language ON public.task_comments(language);
