-- Prepare DB for release: clean data while keeping founder admin profile
-- Notes:
-- - Does NOT modify schemas or RLS
-- - Deletes only data from public tables
-- - Keeps only the admin profile for founder@hightechai.site
-- - Normalizes names in profiles: OLEKSANDR->Pavel, KOVALCHUK->Ossenniy

BEGIN;

-- 1) Normalize names in profiles
UPDATE public.profiles
SET full_name = replace(replace(full_name, 'OLEKSANDR', 'Pavel'), 'KOVALCHUK', 'Ossenniy');

-- 2) Delete child records first to avoid reference issues
DELETE FROM public.task_comments;
DELETE FROM public.task_history;
DELETE FROM public.task_participants;
DELETE FROM public.task_translations;

-- 3) Delete core entities
DELETE FROM public.tasks;
DELETE FROM public.issues;
DELETE FROM public.projects;
DELETE FROM public.chat_invitations;
DELETE FROM public.achievements;
DELETE FROM public.employee_performance;
DELETE FROM public.notifications;
DELETE FROM public.companies;
DELETE FROM public.webhook_logs;

-- 4) Keep only founder profile, remove all other profiles
DELETE FROM public.profiles p
WHERE p.id NOT IN (
  SELECT p2.id
  FROM public.profiles p2
  JOIN auth.users u ON u.id = p2.user_id
  WHERE u.email = 'founder@hightechai.site'
);

-- 5) Ensure founder is admin and active
UPDATE public.profiles p
SET role = 'admin', is_active = true
WHERE p.id IN (
  SELECT p2.id
  FROM public.profiles p2
  JOIN auth.users u ON u.id = p2.user_id
  WHERE u.email = 'founder@hightechai.site'
);

COMMIT;