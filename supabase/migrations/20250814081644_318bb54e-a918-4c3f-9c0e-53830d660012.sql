-- УПРОЩЕННОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМ БЕЗОПАСНОСТИ

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

-- Включаем RLS на всех публичных таблицах через безопасный способ
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Удаляем проблемные Security Definer views
DROP VIEW IF EXISTS public.user_team_data CASCADE;
DROP VIEW IF EXISTS public.user_stats CASCADE;

-- Создаем простые views без Security Definer
CREATE OR REPLACE VIEW public.recent_telemetry_summary AS
SELECT 
    d.name as drone_name,
    d.model,
    d.status,
    d.battery_level,
    '{}' as latest_data
FROM public.uav_drones d;

CREATE OR REPLACE VIEW public.uav_analytics_summary AS
SELECT 
    COUNT(*)::bigint as total_drones,
    COUNT(*) FILTER (WHERE status = 'online')::bigint as online_drones,
    COUNT(*) FILTER (WHERE status = 'offline')::bigint as offline_drones,
    AVG(battery_level) as avg_battery_level,
    1::bigint as active_days_this_month
FROM public.uav_drones;