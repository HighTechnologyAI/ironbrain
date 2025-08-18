-- Enable realtime for drone ecosystem tables
ALTER TABLE public.drone_telemetry REPLICA IDENTITY FULL;
ALTER TABLE public.drones REPLICA IDENTITY FULL;
ALTER TABLE public.missions_extended REPLICA IDENTITY FULL;
ALTER TABLE public.mission_assignments REPLICA IDENTITY FULL;
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.drones_extended REPLICA IDENTITY FULL;

-- Add tables to realtime publication
DO $$ 
BEGIN
  -- drone_telemetry
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'drone_telemetry'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE drone_telemetry;
  END IF;
  
  -- drones
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'drones'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE drones;
  END IF;
  
  -- missions_extended
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'missions_extended'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE missions_extended;
  END IF;
  
  -- mission_assignments
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'mission_assignments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE mission_assignments;
  END IF;
  
  -- events
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE events;
  END IF;
  
  -- drones_extended
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'drones_extended'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE drones_extended;
  END IF;
END $$;