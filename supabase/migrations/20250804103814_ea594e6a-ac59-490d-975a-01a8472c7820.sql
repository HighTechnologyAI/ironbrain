-- Исправление политики для админов - используем security definer функцию для избежания рекурсии
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS public.profiles AS $$
  SELECT * FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Обновляем политику админов
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;

CREATE POLICY "Admins can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  (public.get_current_user_profile()).role = 'admin'::employee_role
  OR 
  user_id = (public.get_current_user_profile()).id
);