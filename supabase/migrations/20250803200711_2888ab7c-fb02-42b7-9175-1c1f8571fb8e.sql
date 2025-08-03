-- Insert demo profiles with usernames as full names
INSERT INTO public.profiles (full_name, position, department, role, hire_date, is_active, phone, telegram_username, salary)
VALUES 
  ('alpi', 'COO / Operation Director', 'Управление', 'manager', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@alpi', 150000),
  ('miki', 'Marketing Director', 'Маркетинг', 'manager', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@miki', 120000),
  ('jan', 'Top Specialist', 'Экспертиза', 'employee', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@jan', 100000),
  ('alex', 'Factory Manager', 'Производство', 'manager', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@alex', 110000),
  ('brat', 'Factory Director', 'Производство', 'manager', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@brat', 140000),
  ('dani', 'CEO', 'Руководство', 'admin', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@dani', 200000),
  ('ilo', 'Founder', 'Руководство', 'admin', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@ilo', 250000),
  ('peter', 'IT Manager', 'IT', 'manager', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@peter', 130000),
  ('chef', 'Senior Advisor', 'Консультации', 'manager', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@chef', 180000);