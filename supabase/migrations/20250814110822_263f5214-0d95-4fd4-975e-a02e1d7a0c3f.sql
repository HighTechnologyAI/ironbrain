-- Simple demo data insertion without new columns
DO $$
DECLARE
    admin_profile_id UUID;
BEGIN
    -- Try to get an existing admin profile or create one for demo
    SELECT id INTO admin_profile_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    
    -- If no admin profile exists, use any profile or null
    IF admin_profile_id IS NULL THEN
        SELECT id INTO admin_profile_id FROM public.profiles LIMIT 1;
    END IF;

    -- Insert demo drones with basic columns only
    INSERT INTO public.uav_drones (
        name, model, serial, status, battery_level, firmware, 
        location_lat, location_lon, created_by
    ) 
    SELECT 
        'Phoenix-01', 'DJI Matrice 300 RTK', 'PHX001-2024', 'ready', 85, 'v4.0.12',
        43.3889, 26.8855, admin_profile_id
    WHERE NOT EXISTS (SELECT 1 FROM public.uav_drones WHERE name = 'Phoenix-01');

    INSERT INTO public.uav_drones (
        name, model, serial, status, battery_level, firmware, 
        created_by
    ) 
    SELECT 
        'Eagle-02', 'DJI Matrice 300 RTK', 'EGL002-2024', 'maintenance', 12, 'v4.0.10',
        admin_profile_id
    WHERE NOT EXISTS (SELECT 1 FROM public.uav_drones WHERE name = 'Eagle-02');

    INSERT INTO public.uav_drones (
        name, model, serial, status, battery_level, firmware, 
        location_lat, location_lon, created_by
    ) 
    SELECT 
        'Hawk-03', 'Autel EVO II Pro', 'HWK003-2024', 'ready', 92, 'v2.1.4',
        43.3892, 26.8860, admin_profile_id
    WHERE NOT EXISTS (SELECT 1 FROM public.uav_drones WHERE name = 'Hawk-03');

    -- Insert demo missions
    INSERT INTO public.missions (
        name, description, status, drone_id, waypoints, altitude_meters, progress, created_by
    ) 
    SELECT 
        'Патрулирование периметра', 'Регулярное патрулирование периметра аэродрома', 'planning',
        (SELECT id FROM uav_drones WHERE name = 'Phoenix-01' LIMIT 1),
        8, 150, 0, admin_profile_id
    WHERE NOT EXISTS (SELECT 1 FROM public.missions WHERE name = 'Патрулирование периметра');

    INSERT INTO public.missions (
        name, description, status, drone_id, waypoints, altitude_meters,
        start_time, progress, created_by
    ) 
    SELECT 
        'Инспекция инфраструктуры', 'Проверка состояния взлетно-посадочной полосы', 'armed',
        (SELECT id FROM uav_drones WHERE name = 'Hawk-03' LIMIT 1),
        12, 80, now() - INTERVAL '5 minutes', 25, admin_profile_id
    WHERE NOT EXISTS (SELECT 1 FROM public.missions WHERE name = 'Инспекция инфраструктуры');

    -- Insert active mission for demo
    INSERT INTO public.missions (
        name, description, status, drone_id, waypoints, altitude_meters,
        start_time, progress, created_by
    ) 
    SELECT 
        'Активная операция наблюдения', 'Мониторинг восточного сектора аэродрома', 'in_flight',
        (SELECT id FROM uav_drones WHERE name = 'Phoenix-01' LIMIT 1),
        6, 120, now() - INTERVAL '15 minutes', 68, admin_profile_id
    WHERE NOT EXISTS (SELECT 1 FROM public.missions WHERE name = 'Активная операция наблюдения');
    
END $$;