-- Fix critical security issues - enable RLS on tables that need it

-- Enable RLS on mission_logs if not enabled
ALTER TABLE public.mission_logs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on mission_waypoints if not enabled  
ALTER TABLE public.mission_waypoints ENABLE ROW LEVEL SECURITY;

-- Check if uav_telemetry has RLS enabled and enable if not
DO $$
BEGIN
    -- This will attempt to enable RLS only if the table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'uav_telemetry') THEN
        BEGIN
            ALTER TABLE public.uav_telemetry ENABLE ROW LEVEL SECURITY;
        EXCEPTION WHEN OTHERS THEN
            -- Table might already have RLS enabled
            NULL;
        END;
    END IF;
END $$;