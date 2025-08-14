-- ИСПРАВЛЕНИЕ РЕКУРСИВНЫХ RLS ПОЛИТИК

-- Исправляем функцию для получения текущего профиля
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS profiles
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT * FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Пересоздаем политики для таблицы tasks без рекурсии
DROP POLICY IF EXISTS "Users can view tasks assigned to them" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tasks they have access to" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tasks where they are participants" ON public.tasks;
DROP POLICY IF EXISTS "Admins can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks assigned to them" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their tasks" ON public.tasks;
DROP POLICY IF EXISTS "Admins can delete tasks" ON public.tasks;

-- Создаем простые и безопасные политики для tasks
CREATE POLICY "tasks_select_policy" ON public.tasks
FOR SELECT USING (
    assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) OR
    created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) OR
    (SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) = 'admin'
);

CREATE POLICY "tasks_insert_policy" ON public.tasks
FOR INSERT WITH CHECK (
    created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
);

CREATE POLICY "tasks_update_policy" ON public.tasks
FOR UPDATE USING (
    assigned_to = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) OR
    created_by = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) OR
    (SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) = 'admin'
);

CREATE POLICY "tasks_delete_policy" ON public.tasks
FOR DELETE USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) = 'admin'
);

-- Исправляем политики для task_participants
DROP POLICY IF EXISTS "Users can view participants for tasks they have access to" ON public.task_participants;
DROP POLICY IF EXISTS "Admins can add participants" ON public.task_participants;
DROP POLICY IF EXISTS "Admins can remove participants" ON public.task_participants;

CREATE POLICY "task_participants_select_policy" ON public.task_participants
FOR SELECT USING (
    user_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) OR
    (SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) = 'admin'
);

CREATE POLICY "task_participants_insert_policy" ON public.task_participants
FOR INSERT WITH CHECK (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) = 'admin'
);

CREATE POLICY "task_participants_delete_policy" ON public.task_participants
FOR DELETE USING (
    (SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) = 'admin'
);