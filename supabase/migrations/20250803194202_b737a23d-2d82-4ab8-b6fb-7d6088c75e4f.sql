-- Добавляем всех сотрудников с их никами в базу данных
INSERT INTO profiles (user_id, full_name, position, department, role, hire_date, is_active, phone, telegram_username, salary) VALUES
(gen_random_uuid(), 'Алпи', 'COO / Operation Director', 'Управление', 'coo', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@alpi', 150000),
(gen_random_uuid(), 'Мики', 'Marketing Director', 'Маркетинг', 'marketing_director', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@miki', 120000),
(gen_random_uuid(), 'Жан', 'Top Specialist', 'Экспертиза', 'specialist', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@jan', 100000),
(gen_random_uuid(), 'Алекс', 'Factory Manager', 'Производство', 'factory_manager', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@alex', 110000),
(gen_random_uuid(), 'Брат', 'Factory Director', 'Производство', 'factory_director', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@brat', 140000),
(gen_random_uuid(), 'Дани', 'CEO', 'Руководство', 'ceo', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@dani', 200000),
(gen_random_uuid(), 'Ило', 'Founder', 'Руководство', 'founder', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@ilo', 250000),
(gen_random_uuid(), 'Питер', 'IT Manager', 'IT', 'it_manager', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@peter', 130000),
(gen_random_uuid(), 'Шеф', 'Senior Advisor', 'Консультации', 'advisor', CURRENT_DATE, true, '+7-XXX-XXX-XX-XX', '@chef', 180000);