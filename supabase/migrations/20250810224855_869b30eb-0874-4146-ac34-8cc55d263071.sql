-- Fix/ensure policy for viewing tasks where user is a participant
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'tasks' 
      AND policyname = 'Users can view tasks where they are participants'
  ) THEN
    EXECUTE 'DROP POLICY "Users can view tasks where they are participants" ON public.tasks';
  END IF;
END $$;

CREATE POLICY "Users can view tasks where they are participants"
ON public.tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.task_participants tp
    JOIN public.profiles p ON p.id = tp.user_id
    WHERE tp.task_id = public.tasks.id AND p.user_id = auth.uid()
  )
);
