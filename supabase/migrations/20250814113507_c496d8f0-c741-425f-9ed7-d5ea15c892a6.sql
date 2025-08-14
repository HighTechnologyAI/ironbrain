-- Сначала удалим существующие политики, чтобы создать правильные
DROP POLICY IF EXISTS "Authenticated users can view drones" ON uav_drones;
DROP POLICY IF EXISTS "Authenticated users can create drones" ON uav_drones;
DROP POLICY IF EXISTS "Users can update drones they created" ON uav_drones;
DROP POLICY IF EXISTS "Admins can delete drones" ON uav_drones;

-- Включаем RLS если еще не включен
ALTER TABLE uav_drones ENABLE ROW LEVEL SECURITY;

-- Создаем правильные политики RLS
CREATE POLICY "Everyone can view drones" 
ON uav_drones 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create drones" 
ON uav_drones 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update drones" 
ON uav_drones 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete drones" 
ON uav_drones 
FOR DELETE 
USING (auth.uid() IS NOT NULL);