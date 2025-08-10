-- Add admin override to view all tasks
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'tasks' 
      AND policyname = 'Admins can view all tasks'
  ) THEN
    EXECUTE 'DROP POLICY "Admins can view all tasks" ON public.tasks';
  END IF;
END $$;

CREATE POLICY "Admins can view all tasks"
ON public.tasks
FOR SELECT
USING ((get_current_user_profile()).role = 'admin'::employee_role);
