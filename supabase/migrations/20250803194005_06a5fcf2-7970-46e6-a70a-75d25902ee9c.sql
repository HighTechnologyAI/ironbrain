-- Обновляем профили сотрудников - оставляем только ники
UPDATE profiles SET full_name = 'Алпи' WHERE full_name LIKE '%Александр%';
UPDATE profiles SET full_name = 'Мики' WHERE full_name LIKE '%Мария%';  
UPDATE profiles SET full_name = 'Жан' WHERE full_name LIKE '%Дмитрий%';
UPDATE profiles SET full_name = 'Алекс' WHERE full_name LIKE '%Елена%';