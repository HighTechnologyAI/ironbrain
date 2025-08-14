-- КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ RLS 
-- Включаем Row Level Security на всех таблицах public схемы

-- 1. Включить RLS на основных таблицах
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uav_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_history ENABLE ROW LEVEL SECURITY;

-- 2. Добавить базовые RLS политики
-- Политики для tasks
DROP POLICY IF EXISTS "Users can view tasks they have access to" ON public.tasks;
CREATE POLICY "Users can view tasks they have access to" 
ON public.tasks FOR SELECT 
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
CREATE POLICY "Users can create tasks" 
ON public.tasks FOR INSERT 
WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update their tasks" ON public.tasks;
CREATE POLICY "Users can update their tasks" 
ON public.tasks FOR UPDATE 
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Политики для projects  
DROP POLICY IF EXISTS "Users can view projects" ON public.projects;
CREATE POLICY "Users can view projects" 
ON public.projects FOR SELECT 
USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
  )
);

DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
CREATE POLICY "Users can create projects" 
ON public.projects FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Политики для issues
DROP POLICY IF EXISTS "Users can view issues" ON public.issues;
CREATE POLICY "Users can view issues" 
ON public.issues FOR SELECT 
USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
  )
);

DROP POLICY IF EXISTS "Users can create issues" ON public.issues;
CREATE POLICY "Users can create issues" 
ON public.issues FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Политики для UAV events (только просмотр для аутентифицированных)
DROP POLICY IF EXISTS "Authenticated users can view UAV events" ON public.uav_events;
CREATE POLICY "Authenticated users can view UAV events" 
ON public.uav_events FOR SELECT 
USING (auth.role() = 'authenticated');

-- Политики для AI analysis (пользователи видят только свои анализы)
DROP POLICY IF EXISTS "Users can view their AI analysis" ON public.ai_analysis_history;
CREATE POLICY "Users can view their AI analysis" 
ON public.ai_analysis_history FOR SELECT 
USING (
  auth.uid()::text = user_id OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can create AI analysis" ON public.ai_analysis_history;
CREATE POLICY "Users can create AI analysis" 
ON public.ai_analysis_history FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- Обновить views для корректной работы с RLS
DROP VIEW IF EXISTS public.task_details CASCADE;
CREATE VIEW public.task_details AS
SELECT 
  t.*,
  p_creator.full_name as creator_name,
  p_assignee.full_name as assignee_name,
  proj.name as project_name
FROM public.tasks t
LEFT JOIN public.profiles p_creator ON t.created_by = p_creator.user_id
LEFT JOIN public.profiles p_assignee ON t.assigned_to = p_assignee.user_id  
LEFT JOIN public.projects proj ON t.project_id = proj.id;