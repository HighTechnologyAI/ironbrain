-- Create AI analysis history table
CREATE TABLE IF NOT EXISTS public.ai_analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  analysis_type TEXT NOT NULL,
  input_data JSONB,
  result_data TEXT,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  execution_time_ms INTEGER,
  tokens_used INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT
);

-- Enable Row Level Security
ALTER TABLE public.ai_analysis_history ENABLE ROW LEVEL SECURITY;

-- Create policies for AI analysis history
CREATE POLICY "Users can view their own AI analysis history" 
ON public.ai_analysis_history 
FOR SELECT 
USING (user_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Users can create their own AI analysis history" 
ON public.ai_analysis_history 
FOR INSERT 
WITH CHECK (user_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_user_id ON public.ai_analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_created_at ON public.ai_analysis_history(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_provider ON public.ai_analysis_history(provider);

-- Create UAV data aggregation view for AI analysis
CREATE OR REPLACE VIEW public.uav_analytics_summary AS
SELECT 
  COUNT(*) as total_drones,
  COUNT(*) FILTER (WHERE status = 'online') as online_drones,
  COUNT(*) FILTER (WHERE status = 'offline') as offline_drones,
  AVG(battery_level) as avg_battery_level,
  COUNT(DISTINCT DATE(last_contact)) as active_days_this_month
FROM public.uav_drones
WHERE last_contact >= CURRENT_DATE - INTERVAL '30 days';

-- Create recent telemetry summary for AI analysis
CREATE OR REPLACE VIEW public.recent_telemetry_summary AS
SELECT 
  d.name as drone_name,
  d.model,
  d.battery_level,
  d.status,
  t.latest_data
FROM public.uav_drones d
LEFT JOIN (
  SELECT 
    drone_id,
    jsonb_build_object(
      'latest_altitude', MAX(alt),
      'latest_speed', MAX(speed_ms),
      'latest_battery_voltage', MAX(battery_v),
      'latest_temperature', MAX(esc_temp_c),
      'data_points_last_hour', COUNT(*)
    ) as latest_data
  FROM public.uav_telemetry 
  WHERE ts >= NOW() - INTERVAL '1 hour'
  GROUP BY drone_id
) t ON d.id = t.drone_id;