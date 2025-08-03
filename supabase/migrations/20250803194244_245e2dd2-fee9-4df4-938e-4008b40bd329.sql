-- Добавляем всех сотрудников с правильными ролями
INSERT INTO profiles (user_id, full_name, position, department, role, hire_date, is_active, phone, telegram_username, salary) VALUES
(gen_random_uuid(), 'Алпи', 'COO / Operation Director', 'Управление', 'manager', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@alpi', 150000),
(gen_random_uuid(), 'Мики', 'Marketing Director', 'Маркетинг', 'manager', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@miki', 120000),
(gen_random_uuid(), 'Жан', 'Top Specialist', 'Экспертиза', 'employee', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@jan', 100000),
(gen_random_uuid(), 'Алекс', 'Factory Manager', 'Производство', 'manager', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@alex', 110000),
(gen_random_uuid(), 'Брат', 'Factory Director', 'Производство', 'manager', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@brat', 140000),
(gen_random_uuid(), 'Дани', 'CEO', 'Руководство', 'admin', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@dani', 200000),
(gen_random_uuid(), 'Ило', 'Founder', 'Руководство', 'admin', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@ilo', 250000),
(gen_random_uuid(), 'Питер', 'IT Manager', 'IT', 'manager', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@peter', 130000),
(gen_random_uuid(), 'Шеф', 'Senior Advisor', 'Консультации', 'manager', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@chef', 180000);