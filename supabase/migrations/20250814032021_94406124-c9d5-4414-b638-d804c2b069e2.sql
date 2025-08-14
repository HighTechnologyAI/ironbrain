-- ИСПРАВЛЕНИЕ RLS: Корректная схема БД
-- Включаем Row Level Security на всех таблицах public схемы

-- 1. Включить RLS на основных таблицах
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY; 
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uav_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_history ENABLE ROW LEVEL SECURITY;

-- 2. RLS политики для tasks (правильные имена колонок)
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

-- 3. RLS политики для projects
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

-- 4. RLS политики для issues (правильные имена колонок)
DROP POLICY IF EXISTS "Users can view issues" ON public.issues;
CREATE POLICY "Users can view issues" 
ON public.issues FOR SELECT 
USING (
  auth.uid() = reported_by OR 
  auth.uid() = assigned_to OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
  )
);

DROP POLICY IF EXISTS "Users can create issues" ON public.issues;
CREATE POLICY "Users can create issues" 
ON public.issues FOR INSERT 
WITH CHECK (auth.uid() = reported_by);

-- 5. RLS политики для UAV events (только аутентифицированные пользователи)
DROP POLICY IF EXISTS "Authenticated users can view UAV events" ON public.uav_events;
CREATE POLICY "Authenticated users can view UAV events" 
ON public.uav_events FOR SELECT 
USING (auth.role() = 'authenticated');

-- 6. RLS политики для AI analysis (пользователи видят только свои анализы)
DROP POLICY IF EXISTS "Users can view their AI analysis" ON public.ai_analysis_history;
CREATE POLICY "Users can view their AI analysis" 
ON public.ai_analysis_history FOR SELECT 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Users can create AI analysis" ON public.ai_analysis_history;
CREATE POLICY "Users can create AI analysis" 
ON public.ai_analysis_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);