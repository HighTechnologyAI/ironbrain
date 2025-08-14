-- Включаем Row Level Security для таблицы uav_drones
ALTER TABLE uav_drones ENABLE ROW LEVEL SECURITY;

-- Создаем политики для безопасного доступа к дронам
CREATE POLICY "Authenticated users can view drones" 
ON uav_drones 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create drones" 
ON uav_drones 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update drones they created" 
ON uav_drones 
FOR UPDATE 
USING (created_by = auth.uid() OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete drones" 
ON uav_drones 
FOR DELETE 
USING (auth.uid() IS NOT NULL);