-- Allow admins to update any profile's department (and other fields)
DO $$ BEGIN
  -- Create policy only if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Admins can update any profile'
  ) THEN
    CREATE POLICY "Admins can update any profile"
    ON public.profiles
    FOR UPDATE
    USING ((get_current_user_profile()).role = 'admin')
    WITH CHECK ((get_current_user_profile()).role = 'admin');
  END IF;
END $$;