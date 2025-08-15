-- Найдем все дублирующие записи objectives и оставим только самую актуальную
UPDATE objectives 
SET status = 'archived'
WHERE title LIKE 'ДРОН-ШОУ%' 
  AND id != (
    SELECT id 
    FROM objectives 
    WHERE title LIKE 'ДРОН-ШОУ%' 
      AND status = 'active'
    ORDER BY updated_at DESC 
    LIMIT 1
  );

-- Обновим самую актуальную запись с правильным названием
UPDATE objectives 
SET title = 'ДРОН-ШОУ 2025: Переломный момент для Tiger Technology - заключение многомиллионного контракта через демонстрацию передовых технологий',
    updated_at = now()
WHERE title LIKE 'ДРОН-ШОУ%' 
  AND status = 'active';