-- Update handle_new_user function to process new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, position, department, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data ->> 'position', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'department', ''),
        'employee'
    );
    RETURN NEW;
END;
$function$;