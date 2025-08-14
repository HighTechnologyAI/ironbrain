-- ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ RLS - Включаем RLS на всех оставшихся таблицах

-- Включаем RLS на всех остальных таблицах из схемы
ALTER TABLE public.uav_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uav_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uav_telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS политики для UAV events
CREATE POLICY "Users can view UAV events" 
ON public.uav_events FOR SELECT 
USING (
  public.get_current_user_role() IN ('admin', 'manager') OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('operator', 'pilot')
  )
);

CREATE POLICY "Operators can create UAV events" 
ON public.uav_events FOR INSERT 
WITH CHECK (
  public.get_current_user_role() IN ('admin', 'manager', 'operator', 'pilot')
);

-- RLS политики для UAV missions
CREATE POLICY "Users can view UAV missions" 
ON public.uav_missions FOR SELECT 
USING (
  assigned_pilot IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ) OR
  created_by IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ) OR
  public.get_current_user_role() IN ('admin', 'manager')
);

CREATE POLICY "Users can create UAV missions" 
ON public.uav_missions FOR INSERT 
WITH CHECK (
  created_by IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Pilots can update their missions" 
ON public.uav_missions FOR UPDATE 
USING (
  assigned_pilot IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ) OR
  created_by IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ) OR
  public.get_current_user_role() IN ('admin', 'manager')
);

-- RLS политики для UAV telemetry
CREATE POLICY "Users can view UAV telemetry" 
ON public.uav_telemetry FOR SELECT 
USING (
  public.get_current_user_role() IN ('admin', 'manager', 'operator', 'pilot')
);

CREATE POLICY "System can insert telemetry" 
ON public.uav_telemetry FOR INSERT 
WITH CHECK (true); -- Разрешаем вставку телеметрии от системы

-- RLS политики для VIP guests
CREATE POLICY "Admins can manage VIP guests" 
ON public.vip_guests FOR ALL 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Managers can view VIP guests" 
ON public.vip_guests FOR SELECT 
USING (public.get_current_user_role() IN ('admin', 'manager'));

-- RLS политики для webhook logs
CREATE POLICY "Admins can view webhook logs" 
ON public.webhook_logs FOR SELECT 
USING (public.get_current_user_role() = 'admin');