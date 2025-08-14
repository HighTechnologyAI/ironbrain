-- ИСПРАВЛЕНИЕ РЕКУРСИИ В ПОЛИТИКАХ И УПРОЩЕНИЕ VIEWS

-- Исправляем функцию с правильным search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = ''
AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Исправляем политики для tasks которые вызывают рекурсию
DROP POLICY IF EXISTS "Users can update their tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view tasks they have access to" ON public.tasks;

-- Создаем простые политики для tasks без рекурсии
CREATE POLICY "Users can view accessible tasks" 
ON public.tasks FOR SELECT 
USING (
  assigned_to IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "Users can update accessible tasks" 
ON public.tasks FOR UPDATE 
USING (
  assigned_to IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  created_by IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
  public.get_current_user_role() = 'admin'
);

-- Удаляем все проблемные views
DROP VIEW IF EXISTS public.user_team_data CASCADE;
DROP VIEW IF EXISTS public.user_stats CASCADE;
DROP VIEW IF EXISTS public.recent_telemetry_summary CASCADE;
DROP VIEW IF EXISTS public.uav_analytics_summary CASCADE;

-- Создаем простые views без несуществующих колонок
CREATE OR REPLACE VIEW public.recent_telemetry_summary AS
SELECT 
    d.name as drone_name,
    d.model,
    d.status,
    d.battery_level,
    NULL::jsonb as latest_data
FROM public.uav_drones d;

CREATE OR REPLACE VIEW public.uav_analytics_summary AS
SELECT 
    COUNT(*)::bigint as total_drones,
    COUNT(*) FILTER (WHERE status = 'online')::bigint as online_drones,
    COUNT(*) FILTER (WHERE status = 'offline')::bigint as offline_drones,
    AVG(battery_level)::double precision as avg_battery_level,
    0::bigint as active_days_this_month
FROM public.uav_drones;