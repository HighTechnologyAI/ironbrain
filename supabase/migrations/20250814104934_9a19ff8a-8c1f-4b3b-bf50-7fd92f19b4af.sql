-- Create missions table
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'armed', 'in_flight', 'completed', 'aborted')),
  drone_id UUID REFERENCES public.uav_drones(id),
  waypoints INTEGER DEFAULT 0,
  altitude_meters INTEGER,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for missions
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

-- Create policies for missions
CREATE POLICY "Users can view all missions" 
ON public.missions 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create missions" 
ON public.missions 
FOR INSERT 
WITH CHECK (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update missions they created" 
ON public.missions 
FOR UPDATE 
USING (created_by IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_missions_updated_at
BEFORE UPDATE ON public.missions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update uav_drones table RLS policies to allow viewing (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'uav_drones' 
        AND policyname = 'Users can view all drones'
    ) THEN
        CREATE POLICY "Users can view all drones" 
        ON public.uav_drones 
        FOR SELECT 
        USING (true);
    END IF;
END $$;

-- Insert some sample data
INSERT INTO public.uav_drones (name, model, serial, status, battery_level, firmware, location_lat, location_lon, last_contact) VALUES
('Alpha-01', 'DJI Mavic 3', 'UAV-001-2024', 'armed', 87.5, 'v2.4.1', 55.7558, 37.6176, now() - interval '2 seconds'),
('Beta-03', 'DJI Mini 4 Pro', 'UAV-003-2024', 'ready', 92.0, 'v2.4.1', 55.7512, 37.6156, now() - interval '1 second'),
('Gamma-02', 'DJI Air 3', 'UAV-002-2024', 'warning', 23.0, 'v2.3.8', 55.7490, 37.6200, now() - interval '15 seconds');

INSERT INTO public.missions (name, description, status, drone_id, waypoints, altitude_meters, progress, start_time) VALUES
('Патрулирование периметра А', 'Регулярное патрулирование восточного периметра объекта', 'in_flight', (SELECT id FROM uav_drones WHERE name = 'Alpha-01'), 12, 150, 65, now() - interval '23 minutes 45 seconds'),
('Инспекция объекта В-12', 'Детальная инспекция промышленного объекта В-12', 'armed', (SELECT id FROM uav_drones WHERE name = 'Beta-03'), 8, 80, 0, null);