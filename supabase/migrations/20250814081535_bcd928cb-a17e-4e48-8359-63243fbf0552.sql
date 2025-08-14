-- ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ С ПРАВИЛЬНЫМИ КОЛОНКАМИ

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

-- Включаем RLS на всех оставшихся таблицах
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Удаляем проблемные Security Definer views если они существуют
DROP VIEW IF EXISTS public.user_team_data CASCADE;
DROP VIEW IF EXISTS public.user_stats CASCADE;
DROP VIEW IF EXISTS public.recent_telemetry_summary CASCADE;
DROP VIEW IF EXISTS public.uav_analytics_summary CASCADE;

-- Создаем безопасные обычные views с правильными колонками
CREATE OR REPLACE VIEW public.recent_telemetry_summary AS
SELECT 
    d.name as drone_name,
    d.model,
    d.status,
    d.battery_level,
    jsonb_build_object(
        'lat', t.lat,
        'lon', t.lon,
        'altitude', t.altitude,
        'speed', t.speed,
        'heading', t.heading,
        'battery_level', t.battery_level
    ) as latest_data
FROM public.uav_drones d
LEFT JOIN LATERAL (
    SELECT lat, lon, altitude, speed, heading, battery_level
    FROM public.uav_telemetry 
    WHERE drone_id = d.id 
    ORDER BY timestamp DESC 
    LIMIT 1
) t ON true;

CREATE OR REPLACE VIEW public.uav_analytics_summary AS
SELECT 
    COUNT(*)::bigint as total_drones,
    COUNT(*) FILTER (WHERE status = 'online')::bigint as online_drones,
    COUNT(*) FILTER (WHERE status = 'offline')::bigint as offline_drones,
    AVG(battery_level)::double precision as avg_battery_level,
    COUNT(DISTINCT DATE(last_contact)) FILTER (WHERE last_contact >= CURRENT_DATE - INTERVAL '30 days')::bigint as active_days_this_month
FROM public.uav_drones;