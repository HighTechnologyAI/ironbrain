-- ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ - ТОЛЬКО СУЩЕСТВУЮЩИЕ ТАБЛИЦЫ

-- Исправляем функцию с правильным search_path
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = ''
AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Удаляем все проблемные Security Definer views
DROP VIEW IF EXISTS public.user_team_data CASCADE;
DROP VIEW IF EXISTS public.user_stats CASCADE;

-- Проверяем, что RLS включен на основных таблицах
DO $$
BEGIN
    -- Включаем RLS только если таблица существует
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
        ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;