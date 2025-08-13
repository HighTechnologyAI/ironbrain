-- Add language column to tasks table
ALTER TABLE public.tasks ADD COLUMN language VARCHAR(10);

-- Add index for language column
CREATE INDEX idx_tasks_language ON public.tasks(language);