-- Update functions without dropping to avoid dependency errors

-- Ensure deterministic search_path on helper function
CREATE OR REPLACE FUNCTION public.get_current_user_org_id()
RETURNS UUID 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM public.users_extended WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Ensure deterministic search_path on trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;