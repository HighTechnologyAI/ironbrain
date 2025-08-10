-- Allow users to view tasks where they are participants (in addition to assigned/created)
CREATE POLICY IF NOT EXISTS "Users can view tasks where they are participants"
ON public.tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.task_participants tp
    JOIN public.profiles p ON p.id = tp.user_id
    WHERE tp.task_id = id AND p.user_id = auth.uid()
  )
);
