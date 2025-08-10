-- Grant admin role to the specified user by email
BEGIN;

UPDATE public.profiles p
SET role = 'admin'::employee_role,
    updated_at = now()
FROM auth.users u
WHERE p.user_id = u.id
  AND lower(u.email) = lower('founder@hightechai.site');

COMMIT;