-- Enable real-time for uav_events table
ALTER TABLE public.uav_events REPLICA IDENTITY FULL;

-- Enable real-time for uav_commands table  
ALTER TABLE public.uav_commands REPLICA IDENTITY FULL;

-- Enable real-time for uav_drones table
ALTER TABLE public.uav_drones REPLICA IDENTITY FULL;

-- Enable real-time for ai_analysis_history table
ALTER TABLE public.ai_analysis_history REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.uav_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.uav_commands;
ALTER PUBLICATION supabase_realtime ADD TABLE public.uav_drones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_analysis_history;

-- Create indexes for better real-time performance
CREATE INDEX IF NOT EXISTS idx_uav_events_timestamp ON public.uav_events(ts);
CREATE INDEX IF NOT EXISTS idx_uav_events_severity ON public.uav_events(severity);
CREATE INDEX IF NOT EXISTS idx_uav_commands_status ON public.uav_commands(status);
CREATE INDEX IF NOT EXISTS idx_uav_commands_created_at ON public.uav_commands(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_created_at ON public.ai_analysis_history(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_provider ON public.ai_analysis_history(provider);

-- Create function to generate sample telemetry data
CREATE OR REPLACE FUNCTION generate_sample_telemetry()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert sample UAV event for real-time testing
  INSERT INTO public.uav_events (
    event_type,
    severity,
    message,
    drone_id,
    data
  ) VALUES (
    'telemetry_update',
    'info',
    'Sample telemetry data generated for real-time testing',
    (SELECT id FROM public.uav_drones LIMIT 1),
    jsonb_build_object(
      'battery', 85.5,
      'altitude', 150.0,
      'speed', 25.3,
      'coordinates', jsonb_build_object(
        'lat', 42.3601 + (random() - 0.5) * 0.01,
        'lng', -71.0589 + (random() - 0.5) * 0.01
      )
    )
  );
END;
$$;

-- Create function to cleanup old events (keep only last 1000)
CREATE OR REPLACE FUNCTION cleanup_old_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.uav_events 
  WHERE id NOT IN (
    SELECT id FROM public.uav_events 
    ORDER BY ts DESC 
    LIMIT 1000
  );
END;
$$;