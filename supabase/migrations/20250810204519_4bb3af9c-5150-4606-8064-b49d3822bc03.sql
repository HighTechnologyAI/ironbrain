-- Tighten participant management to admins only
-- Remove creator-based policies on task_participants
BEGIN;

-- Ensure RLS is enabled (safe if already enabled)
ALTER TABLE public.task_participants ENABLE ROW LEVEL SECURITY;

-- Drop policies that allow task creators to add/remove participants
DROP POLICY IF EXISTS "Task creators can add participants" ON public.task_participants;
DROP POLICY IF EXISTS "Task creators can remove participants" ON public.task_participants;

COMMIT;