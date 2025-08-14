-- ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ ПРОБЛЕМ БЕЗОПАСНОСТИ (исправленная версия)

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

-- Проверяем и включаем RLS на всех публичных таблицах
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename NOT IN ('recent_telemetry_summary', 'uav_analytics_summary')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', table_record.tablename);
    END LOOP;
END $$;

-- Удаляем проблемные Security Definer views если они существуют
DROP VIEW IF EXISTS public.user_team_data CASCADE;
DROP VIEW IF EXISTS public.user_stats CASCADE;
DROP VIEW IF EXISTS public.recent_telemetry_summary CASCADE;
DROP VIEW IF EXISTS public.uav_analytics_summary CASCADE;

-- Создаем безопасные обычные views вместо Security Definer
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
        'heading', t.heading
    ) as latest_data
FROM public.uav_drones d
LEFT JOIN LATERAL (
    SELECT lat, lon, altitude, speed, heading
    FROM public.uav_telemetry 
    WHERE drone_id = d.id 
    ORDER BY timestamp DESC 
    LIMIT 1
) t ON true;

CREATE OR REPLACE VIEW public.uav_analytics_summary AS
SELECT 
    COUNT(*) as total_drones,
    COUNT(*) FILTER (WHERE status = 'online') as online_drones,
    COUNT(*) FILTER (WHERE status = 'offline') as offline_drones,
    AVG(battery_level) as avg_battery_level,
    COUNT(DISTINCT DATE(last_contact)) FILTER (WHERE last_contact >= CURRENT_DATE - INTERVAL '30 days') as active_days_this_month
FROM public.uav_drones;