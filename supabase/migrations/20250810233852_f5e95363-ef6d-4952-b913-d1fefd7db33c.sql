-- Cleanup data for release: keep only founder admin profile and normalize names
BEGIN;

-- 1) Normalize names in profiles
UPDATE public.profiles
SET full_name = replace(replace(full_name, 'OLEKSANDR', 'Pavel'), 'KOVALCHUK', 'Ossenniy');

-- 2) Truncate all domain tables except profiles (use CASCADE to resolve FK dependencies)
TRUNCATE TABLE
  public.task_comments,
  public.task_history,
  public.task_participants,
  public.task_translations,
  public.tasks,
  public.issues,
  public.projects,
  public.chat_invitations,
  public.achievements,
  public.employee_performance,
  public.notifications,
  public.companies,
  public.webhook_logs
RESTART IDENTITY CASCADE;

-- 3) Keep only founder profile, remove all others
DELETE FROM public.profiles p
WHERE p.id NOT IN (
  SELECT p2.id
  FROM public.profiles p2
  JOIN auth.users u ON u.id = p2.user_id
  WHERE u.email = 'founder@hightechai.site'
);

-- 4) Ensure founder is admin and active
UPDATE public.profiles p
SET role = 'admin', is_active = true
WHERE p.id IN (
  SELECT p2.id
  FROM public.profiles p2
  JOIN auth.users u ON u.id = p2.user_id
  WHERE u.email = 'founder@hightechai.site'
);

COMMIT;