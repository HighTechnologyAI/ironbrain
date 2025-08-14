-- ЗАВЕРШЕНИЕ ИСПРАВЛЕНИЯ RLS - Включаем RLS на оставшихся таблицах

-- Получаем список всех таблиц без RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Создаем security definer функцию для избежания рекурсии
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS политики для profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT 
USING (public.get_current_user_role() = 'admin');

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS политики для team_members
DROP POLICY IF EXISTS "Users can view team members" ON public.team_members;
CREATE POLICY "Users can view team members" 
ON public.team_members FOR SELECT 
USING (
  auth.uid() = user_id OR
  public.get_current_user_role() IN ('admin', 'manager')
);

-- RLS политики для companies
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
CREATE POLICY "Users can view their company" 
ON public.companies FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND company_id = companies.id
  ) OR
  public.get_current_user_role() = 'admin'
);

-- Удаляем или исправляем Security Definer views
DROP VIEW IF EXISTS public.user_team_data CASCADE;
DROP VIEW IF EXISTS public.user_stats CASCADE;