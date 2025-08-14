-- Fix foreign key constraint and add demo data properly
-- First, insert demo data using profile IDs instead of user IDs

-- Get the first admin profile ID
DO $$
DECLARE
    admin_profile_id UUID;
BEGIN
    -- Try to get an existing admin profile
    SELECT id INTO admin_profile_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    
    -- If no admin exists, create a demo profile for testing
    IF admin_profile_id IS NULL THEN
        INSERT INTO public.profiles (full_name, position, department, role, is_active)
        VALUES ('Demo Admin', 'System Administrator', 'Operations', 'admin', true)
        RETURNING id INTO admin_profile_id;
    END IF;

    -- Insert demo drones only if they don't exist
    INSERT INTO public.uav_drones (
        name, model, serial, status, battery_level, firmware, 
        location_lat, location_lon, flight_hours, total_flights,
        home_latitude, home_longitude, max_flight_time_minutes, max_range_km,
        created_by
    ) 
    SELECT 
        'Phoenix-01', 'DJI Matrice 300 RTK', 'PHX001-2024', 'ready', 85, 'v4.0.12',
        43.3889, 26.8855, 45.5, 28,
        43.3889, 26.8855, 55, 15,
        admin_profile_id
    WHERE NOT EXISTS (SELECT 1 FROM public.uav_drones WHERE name = 'Phoenix-01');

    INSERT INTO public.uav_drones (
        name, model, serial, status, battery_level, firmware, 
        location_lat, location_lon, flight_hours, total_flights,
        home_latitude, home_longitude, max_flight_time_minutes, max_range_km,
        created_by
    ) 
    SELECT 
        'Eagle-02', 'DJI Matrice 300 RTK', 'EGL002-2024', 'maintenance', 12, 'v4.0.10',
        NULL, NULL, 120.3, 75,
        43.3889, 26.8855, 55, 15,
        admin_profile_id
    WHERE NOT EXISTS (SELECT 1 FROM public.uav_drones WHERE name = 'Eagle-02');

    INSERT INTO public.uav_drones (
        name, model, serial, status, battery_level, firmware, 
        location_lat, location_lon, flight_hours, total_flights,
        home_latitude, home_longitude, max_flight_time_minutes, max_range_km,
        created_by
    ) 
    SELECT 
        'Hawk-03', 'Autel EVO II Pro', 'HWK003-2024', 'ready', 92, 'v2.1.4',
        43.3892, 26.8860, 12.8, 8,
        43.3889, 26.8855, 40, 8,
        admin_profile_id
    WHERE NOT EXISTS (SELECT 1 FROM public.uav_drones WHERE name = 'Hawk-03');

    -- Insert demo missions if they don't exist
    INSERT INTO public.missions (
        name, description, status, drone_id, waypoints, altitude_meters,
        start_time, progress, created_by
    ) 
    SELECT 
        'Патрулирование периметра', 'Регулярное патрулирование периметра аэродрома', 'planning',
        (SELECT id FROM uav_drones WHERE name = 'Phoenix-01' LIMIT 1),
        8, 150, NULL, 0,
        admin_profile_id
    WHERE NOT EXISTS (SELECT 1 FROM public.missions WHERE name = 'Патрулирование периметра');

    INSERT INTO public.missions (
        name, description, status, drone_id, waypoints, altitude_meters,
        start_time, progress, created_by
    ) 
    SELECT 
        'Инспекция инфраструктуры', 'Проверка состояния взлетно-посадочной полосы', 'armed',
        (SELECT id FROM uav_drones WHERE name = 'Hawk-03' LIMIT 1),
        12, 80, now() - INTERVAL '5 minutes', 25,
        admin_profile_id
    WHERE NOT EXISTS (SELECT 1 FROM public.missions WHERE name = 'Инспекция инфраструктуры');

    -- Insert a mission in flight for better demo
    INSERT INTO public.missions (
        name, description, status, drone_id, waypoints, altitude_meters,
        start_time, progress, created_by
    ) 
    SELECT 
        'Активная операция наблюдения', 'Мониторинг восточного сектора аэродрома', 'in_flight',
        (SELECT id FROM uav_drones WHERE name = 'Phoenix-01' LIMIT 1),
        6, 120, now() - INTERVAL '15 minutes', 68,
        admin_profile_id
    WHERE NOT EXISTS (SELECT 1 FROM public.missions WHERE name = 'Активная операция наблюдения');
    
END $$;

-- Add some sample telemetry data for realistic display
INSERT INTO public.uav_telemetry (
    drone_id, latitude, longitude, altitude_meters, speed_mps, heading, 
    battery_voltage, battery_percentage, signal_strength, temperature, 
    pressure, gps_satellites, flight_mode, armed
)
SELECT 
    d.id, 
    43.3889 + (random() - 0.5) * 0.01,  -- Random position near base
    26.8855 + (random() - 0.5) * 0.01,
    d.max_range_km * 10 + (random() * 50), -- Random altitude
    random() * 15,  -- Speed 0-15 m/s
    random() * 360, -- Random heading
    11.1 + (d.battery_level * 0.01 * 1.5), -- Voltage based on battery %
    d.battery_level,
    -50 - (random() * 30)::integer, -- Signal strength -50 to -80 dBm
    15 + (random() * 20), -- Temperature 15-35°C
    1013 + (random() * 20) - 10, -- Pressure around 1013 hPa
    8 + (random() * 7)::integer, -- GPS satellites 8-15
    CASE 
        WHEN d.status = 'ready' THEN 'STABILIZE'
        WHEN d.status = 'in_flight' THEN 'AUTO'
        ELSE 'LAND'
    END,
    d.status = 'in_flight'
FROM public.uav_drones d
WHERE NOT EXISTS (
    SELECT 1 FROM public.uav_telemetry t 
    WHERE t.drone_id = d.id 
    AND t.timestamp > now() - INTERVAL '1 hour'
);