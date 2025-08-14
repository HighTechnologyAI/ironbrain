-- Remove demo data, keep only table structure
DELETE FROM public.missions WHERE name IN (
    'Патрулирование периметра', 
    'Инспекция инфраструктуры', 
    'Активная операция наблюдения'
);

DELETE FROM public.uav_drones WHERE name IN (
    'Phoenix-01', 
    'Eagle-02', 
    'Hawk-03'
);