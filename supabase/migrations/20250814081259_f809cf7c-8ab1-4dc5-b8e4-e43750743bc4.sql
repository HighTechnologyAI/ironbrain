-- СОЗДАНИЕ ФУНКЦИИ И ФИНАЛЬНАЯ НАСТРОЙКА RLS

-- Сначала создаем функцию для получения роли пользователя
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Включаем RLS на всех оставшихся таблицах
ALTER TABLE public.uav_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uav_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uav_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Простые RLS политики для UAV events
CREATE POLICY "Authenticated users can view UAV events" 
ON public.uav_events FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create UAV events" 
ON public.uav_events FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Простые RLS политики для UAV missions  
CREATE POLICY "Users can view accessible UAV missions" 
ON public.uav_missions FOR SELECT 
USING (
  assigned_pilot IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ) OR
  created_by IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ) OR
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can create UAV missions" 
ON public.uav_missions FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update accessible missions" 
ON public.uav_missions FOR UPDATE 
USING (
  assigned_pilot IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ) OR
  created_by IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ) OR
  auth.uid() IS NOT NULL
);

-- Простые RLS политики для UAV telemetry
CREATE POLICY "Authenticated users can view UAV telemetry" 
ON public.uav_telemetry FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert telemetry" 
ON public.uav_telemetry FOR INSERT 
WITH CHECK (true);

-- Простые RLS политики для VIP guests
CREATE POLICY "Authenticated users can view VIP guests" 
ON public.vip_guests FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage VIP guests" 
ON public.vip_guests FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Простые RLS политики для webhook logs
CREATE POLICY "Authenticated users can view webhook logs" 
ON public.webhook_logs FOR SELECT 
USING (auth.uid() IS NOT NULL);