-- Create storage bucket for task files
INSERT INTO storage.buckets (id, name, public) VALUES ('task-files', 'task-files', false);

-- Create task comments table
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  mentioned_users UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task participants table
CREATE TABLE public.task_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'participant' CHECK (role IN ('participant', 'watcher')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_comments
CREATE POLICY "Users can view comments for tasks they have access to"
ON public.task_comments FOR SELECT
USING (
  task_id IN (
    SELECT id FROM public.tasks 
    WHERE assigned_to IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
  OR task_id IN (
    SELECT task_id FROM public.task_participants 
    WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can create comments for tasks they have access to"
ON public.task_comments FOR INSERT
WITH CHECK (
  user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  AND (
    task_id IN (
      SELECT id FROM public.tasks 
      WHERE assigned_to IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
      OR created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
    OR task_id IN (
      SELECT task_id FROM public.task_participants 
      WHERE user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  )
);

CREATE POLICY "Users can update their own comments"
ON public.task_comments FOR UPDATE
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own comments"
ON public.task_comments FOR DELETE
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- RLS policies for task_participants
CREATE POLICY "Users can view participants for tasks they have access to"
ON public.task_participants FOR SELECT
USING (
  task_id IN (
    SELECT id FROM public.tasks 
    WHERE assigned_to IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
  OR user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE POLICY "Task creators can add participants"
ON public.task_participants FOR INSERT
WITH CHECK (
  task_id IN (
    SELECT id FROM public.tasks 
    WHERE created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Task creators can remove participants"
ON public.task_participants FOR DELETE
USING (
  task_id IN (
    SELECT id FROM public.tasks 
    WHERE created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- Storage policies for task files
CREATE POLICY "Users can view task files they have access to"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'task-files' 
  AND (storage.foldername(name))[1] IN (
    SELECT t.id::text FROM public.tasks t
    WHERE t.assigned_to IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR t.created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR t.id IN (
      SELECT tp.task_id FROM public.task_participants tp 
      WHERE tp.user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  )
);

CREATE POLICY "Users can upload files to tasks they have access to"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'task-files' 
  AND (storage.foldername(name))[1] IN (
    SELECT t.id::text FROM public.tasks t
    WHERE t.assigned_to IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR t.created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR t.id IN (
      SELECT tp.task_id FROM public.task_participants tp 
      WHERE tp.user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  )
);

CREATE POLICY "Users can delete files from tasks they have access to"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'task-files' 
  AND (storage.foldername(name))[1] IN (
    SELECT t.id::text FROM public.tasks t
    WHERE t.assigned_to IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR t.created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    OR t.id IN (
      SELECT tp.task_id FROM public.task_participants tp 
      WHERE tp.user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    )
  )
);

-- Add triggers for real-time updates
ALTER TABLE public.task_comments REPLICA IDENTITY FULL;
ALTER TABLE public.task_participants REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_participants;

-- Create trigger for updating updated_at
CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();