-- Add sample issues and achievements data (fix enum values)
INSERT INTO public.issues (title, description, severity, status, reported_by)
SELECT 
  'Ошибка в системе уведомлений',
  'Пользователи не получают уведомления о новых задачах',
  'high'::issue_severity,
  'open',
  id
FROM public.profiles 
LIMIT 1;

INSERT INTO public.issues (title, description, severity, status, reported_by)
SELECT 
  'Медленная загрузка страницы проектов',
  'Страница проектов загружается более 5 секунд',
  'medium'::issue_severity,
  'in_progress',
  id
FROM public.profiles 
LIMIT 1;

INSERT INTO public.achievements (title, description, type, points, employee_id)
SELECT 
  'Первый проект',
  'Создание первого проекта в системе',
  'individual'::achievement_type,
  100,
  id
FROM public.profiles 
LIMIT 1;

INSERT INTO public.achievements (title, description, type, points, employee_id)
SELECT 
  'Завершение задач',
  'Выполнение первых задач в срок',
  'team'::achievement_type,
  50,
  id
FROM public.profiles 
LIMIT 1;