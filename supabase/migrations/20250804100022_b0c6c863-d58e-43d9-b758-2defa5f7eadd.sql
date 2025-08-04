-- Добавим образец достижения для демонстрации работы системы
INSERT INTO achievements (
  title,
  description,
  points,
  type,
  employee_id,
  created_by
) VALUES (
  'Первые шаги',
  'Добро пожаловать в Tiger CRM! Вы успешно вошли в систему и начали работу.',
  50,
  'individual',
  (SELECT id FROM profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1),
  (SELECT id FROM profiles WHERE user_id = (SELECT auth.uid()) LIMIT 1)
) ON CONFLICT DO NOTHING;