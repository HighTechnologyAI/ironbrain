-- ОЧИСТКА И СОЗДАНИЕ ПРАВИЛЬНЫХ RLS ПОЛИТИК

-- Сначала создаем функцию для получения роли пользователя (если еще не создана)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Удаляем существующие политики для UAV таблиц и пересоздаем их
DROP POLICY IF EXISTS "Authenticated users can view UAV events" ON public.uav_events;
DROP POLICY IF EXISTS "Authenticated users can create UAV events" ON public.uav_events;
DROP POLICY IF EXISTS "Users can view accessible UAV missions" ON public.uav_missions;
DROP POLICY IF EXISTS "Users can create UAV missions" ON public.uav_missions;
DROP POLICY IF EXISTS "Users can update accessible missions" ON public.uav_missions;
DROP POLICY IF EXISTS "Authenticated users can view UAV telemetry" ON public.uav_telemetry;
DROP POLICY IF EXISTS "System can insert telemetry" ON public.uav_telemetry;
DROP POLICY IF EXISTS "Authenticated users can view VIP guests" ON public.vip_guests;
DROP POLICY IF EXISTS "Authenticated users can manage VIP guests" ON public.vip_guests;
DROP POLICY IF EXISTS "Authenticated users can view webhook logs" ON public.webhook_logs;

-- Простые RLS политики для UAV events
CREATE POLICY "UAV events view policy" 
ON public.uav_events FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "UAV events insert policy" 
ON public.uav_events FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Простые RLS политики для UAV missions  
CREATE POLICY "UAV missions view policy" 
ON public.uav_missions FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "UAV missions insert policy" 
ON public.uav_missions FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "UAV missions update policy" 
ON public.uav_missions FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Простые RLS политики для UAV telemetry
CREATE POLICY "UAV telemetry view policy" 
ON public.uav_telemetry FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "UAV telemetry insert policy" 
ON public.uav_telemetry FOR INSERT 
WITH CHECK (true);

-- Простые RLS политики для VIP guests
CREATE POLICY "VIP guests view policy" 
ON public.vip_guests FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "VIP guests manage policy" 
ON public.vip_guests FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Простые RLS политики для webhook logs
CREATE POLICY "Webhook logs view policy" 
ON public.webhook_logs FOR SELECT 
USING (auth.uid() IS NOT NULL);