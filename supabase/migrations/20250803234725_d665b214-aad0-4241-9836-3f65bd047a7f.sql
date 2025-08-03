-- Create task attachments table
CREATE TABLE public.task_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task comments table
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task participants table
CREATE TABLE public.task_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Create storage bucket for task files
INSERT INTO storage.buckets (id, name, public) VALUES ('task-files', 'task-files', false);

-- Enable RLS on new tables
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_attachments
CREATE POLICY "Users can view attachments for their tasks" 
ON public.task_attachments 
FOR SELECT 
USING (task_id IN (
  SELECT tasks.id FROM tasks 
  WHERE (tasks.assigned_to IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
     OR (tasks.created_by IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
     OR (tasks.id IN (SELECT task_participants.task_id FROM task_participants 
                      JOIN profiles ON task_participants.user_id = profiles.id 
                      WHERE profiles.user_id = auth.uid()))
));

CREATE POLICY "Users can upload attachments to their tasks" 
ON public.task_attachments 
FOR INSERT 
WITH CHECK (task_id IN (
  SELECT tasks.id FROM tasks 
  WHERE (tasks.assigned_to IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
     OR (tasks.created_by IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
     OR (tasks.id IN (SELECT task_participants.task_id FROM task_participants 
                      JOIN profiles ON task_participants.user_id = profiles.id 
                      WHERE profiles.user_id = auth.uid()))
));

-- RLS policies for task_comments
CREATE POLICY "Users can view comments for their tasks" 
ON public.task_comments 
FOR SELECT 
USING (task_id IN (
  SELECT tasks.id FROM tasks 
  WHERE (tasks.assigned_to IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
     OR (tasks.created_by IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
     OR (tasks.id IN (SELECT task_participants.task_id FROM task_participants 
                      JOIN profiles ON task_participants.user_id = profiles.id 
                      WHERE profiles.user_id = auth.uid()))
));

CREATE POLICY "Users can create comments on their tasks" 
ON public.task_comments 
FOR INSERT 
WITH CHECK (task_id IN (
  SELECT tasks.id FROM tasks 
  WHERE (tasks.assigned_to IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
     OR (tasks.created_by IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
     OR (tasks.id IN (SELECT task_participants.task_id FROM task_participants 
                      JOIN profiles ON task_participants.user_id = profiles.id 
                      WHERE profiles.user_id = auth.uid()))
));

CREATE POLICY "Users can update their own comments" 
ON public.task_comments 
FOR UPDATE 
USING (author_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

-- RLS policies for task_participants
CREATE POLICY "Users can view participants for their tasks" 
ON public.task_participants 
FOR SELECT 
USING (task_id IN (
  SELECT tasks.id FROM tasks 
  WHERE (tasks.assigned_to IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
     OR (tasks.created_by IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
     OR (tasks.id IN (SELECT task_participants.task_id FROM task_participants 
                      JOIN profiles ON task_participants.user_id = profiles.id 
                      WHERE profiles.user_id = auth.uid()))
));

CREATE POLICY "Users can join tasks they have access to" 
ON public.task_participants 
FOR INSERT 
WITH CHECK (task_id IN (
  SELECT tasks.id FROM tasks 
  WHERE (tasks.assigned_to IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
     OR (tasks.created_by IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
));

-- Storage policies for task files
CREATE POLICY "Users can view task files for their tasks" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'task-files' AND name IN (
  SELECT task_attachments.file_path FROM task_attachments 
  WHERE task_attachments.task_id IN (
    SELECT tasks.id FROM tasks 
    WHERE (tasks.assigned_to IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
       OR (tasks.created_by IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
       OR (tasks.id IN (SELECT task_participants.task_id FROM task_participants 
                        JOIN profiles ON task_participants.user_id = profiles.id 
                        WHERE profiles.user_id = auth.uid()))
  )
));

CREATE POLICY "Users can upload task files to their tasks" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'task-files' AND auth.uid() IS NOT NULL);

-- Add trigger for updated_at on task_comments
CREATE TRIGGER update_task_comments_updated_at
BEFORE UPDATE ON public.task_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add realtime for new tables
ALTER TABLE public.task_attachments REPLICA IDENTITY FULL;
ALTER TABLE public.task_comments REPLICA IDENTITY FULL;
ALTER TABLE public.task_participants REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_attachments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_participants;