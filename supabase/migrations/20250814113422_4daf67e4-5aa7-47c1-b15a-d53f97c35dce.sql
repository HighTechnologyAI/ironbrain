-- Добавим тестовые дроны без foreign key ссылки на created_by для начала
INSERT INTO uav_drones (name, model, status, battery_level, location_lat, location_lon, last_contact, serial, firmware) VALUES
('UAV-Alpha-01', 'DJI Mavic 3', 'ready', 85, 43.388944, 26.885444, NOW() - INTERVAL '2 minutes', 'UAV001', 'v2.1.3'),
('UAV-Bravo-02', 'DJI Air 2S', 'in_flight', 65, 43.395234, 26.892156, NOW() - INTERVAL '30 seconds', 'UAV002', 'v2.0.8'),
('UAV-Charlie-03', 'DJI Mini 3', 'armed', 92, 43.382156, 26.878234, NOW() - INTERVAL '1 minute', 'UAV003', 'v1.9.2'),
('UAV-Delta-04', 'Autel EVO Lite+', 'warning', 25, 43.401234, 26.901567, NOW() - INTERVAL '45 seconds', 'UAV004', 'v3.2.1'),
('UAV-Echo-05', 'DJI FPV', 'offline', 0, 43.375678, 26.870123, NOW() - INTERVAL '15 minutes', 'UAV005', 'v1.8.5'),
('UAV-Foxtrot-06', 'Skydio 2+', 'maintenance', 78, 43.412345, 26.920789, NOW() - INTERVAL '3 minutes', 'UAV006', 'v4.1.0'),
('UAV-Golf-07', 'DJI Phantom 4', 'ready', 88, 43.365234, 26.860456, NOW() - INTERVAL '1 minute', 'UAV007', 'v2.3.7'),
('UAV-Hotel-08', 'Parrot ANAFI', 'critical', 12, 43.420567, 26.935123, NOW() - INTERVAL '5 minutes', 'UAV008', 'v1.5.9');