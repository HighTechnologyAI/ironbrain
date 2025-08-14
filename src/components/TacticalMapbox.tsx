import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Drone } from '@/hooks/use-drones';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface TacticalMapboxProps {
  drones: Drone[];
  className?: string;
}

const TacticalMapbox: React.FC<TacticalMapboxProps> = ({ drones, className = '' }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Простая инициализация карты
  useEffect(() => {
    // Если карта уже создана, не создаваем заново
    if (map.current) return;

    // Устанавливаем токен
    mapboxgl.accessToken = 'pk.eyJ1IjoiaGlnaHRlY2hhaSIsImEiOiJjbWViZTBoaW0wbzVwMmpxdmFpeTVnbWdsIn0.8-x4oZ4TfetTTa5BEAXDYg';

    // Ждем готовности DOM
    const timer = setTimeout(() => {
      if (!mapContainer.current) {
        setError('Контейнер карты недоступен');
        setLoading(false);
        return;
      }

      try {
        // Создаем карту
        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [26.8916, 43.3968], // Центр Болгарии
          zoom: 8,
          projection: 'mercator'
        });

        // Добавляем контролы
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Обработчики событий
        mapInstance.on('load', () => {
          console.log('✅ Карта загружена успешно');
          setLoading(false);
          setError(null);
          
          // Добавляем маркеры дронов
          addDroneMarkers();
        });

        mapInstance.on('error', (e) => {
          console.error('❌ Ошибка карты:', e);
          setError('Ошибка загрузки карты');
          setLoading(false);
        });

        map.current = mapInstance;

      } catch (err) {
        console.error('❌ Ошибка создания карты:', err);
        setError('Не удалось создать карту');
        setLoading(false);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      // Очистка при размонтировании
      markers.current.forEach(marker => marker.remove());
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // Только при монтировании

  // Функция создания маркера дрона
  const createDroneMarker = (drone: Drone) => {
    const el = document.createElement('div');
    el.className = 'drone-marker';
    
    const statusColors = {
      ready: '#00ff41',
      armed: '#ff9f00', 
      in_flight: '#00ccff',
      warning: '#ffff00',
      critical: '#ff0000',
      offline: '#666666',
      maintenance: '#9966ff'
    };
    
    const color = statusColors[drone.status as keyof typeof statusColors] || '#666666';
    
    el.innerHTML = `
      <div class="relative group cursor-pointer">
        <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center"
             style="background-color: ${color}20; border-color: ${color};">
          <div class="w-3 h-3 rounded-full animate-pulse" style="background-color: ${color};"></div>
        </div>
        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          <div class="font-medium">${drone.name}</div>
          <div>Статус: ${drone.status || 'unknown'}</div>
          <div>Батарея: ${drone.battery_level || 0}%</div>
        </div>
      </div>
    `;
    
    return el;
  };

  // Добавление маркеров дронов
  const addDroneMarkers = () => {
    if (!map.current) return;

    // Очищаем старые маркеры
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    const validDrones = drones.filter(drone => 
      drone.location_lat && 
      drone.location_lon && 
      !isNaN(drone.location_lat) && 
      !isNaN(drone.location_lon)
    );

    if (validDrones.length === 0) {
      console.log('Нет дронов с валидными координатами');
      return;
    }

    // Создаем маркеры
    validDrones.forEach(drone => {
      const marker = new mapboxgl.Marker({
        element: createDroneMarker(drone),
        anchor: 'center'
      })
      .setLngLat([drone.location_lon!, drone.location_lat!])
      .addTo(map.current!);

      markers.current.push(marker);
    });

    // Подгоняем границы карты под все маркеры
    if (validDrones.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      validDrones.forEach(drone => {
        bounds.extend([drone.location_lon!, drone.location_lat!]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    } else if (validDrones.length === 1) {
      map.current.flyTo({
        center: [validDrones[0].location_lon!, validDrones[0].location_lat!],
        zoom: 10
      });
    }
  };

  // Обновление маркеров при изменении дронов
  useEffect(() => {
    if (map.current && !loading) {
      addDroneMarkers();
    }
  }, [drones, loading]);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${className}`}>
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-500 mb-2">Ошибка загрузки карты</h3>
        <p className="text-sm text-muted-foreground mb-4 text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Перезагрузить
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-full ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Загрузка тактической карты...</p>
        <p className="text-xs text-muted-foreground mt-1">Инициализация Mapbox...</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Контейнер карты */}
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {/* Статус онлайн/офлайн */}
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="secondary" className="bg-green-600/90 text-white">
          <Wifi className="w-3 h-3 mr-1" />
          Онлайн
        </Badge>
      </div>

      {/* Кнопка сброса вида */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={addDroneMarkers}
          className="px-3 py-2 bg-surface-2/90 hover:bg-surface-3 text-foreground border border-border rounded-md transition-colors text-sm"
        >
          Сбросить вид
        </button>
      </div>

      {/* Стили для маркеров */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .drone-marker {
            cursor: pointer;
          }
          .mapboxgl-popup-content {
            background: rgb(17, 24, 39);
            color: white;
            border-radius: 8px;
            border: 1px solid rgb(55, 65, 81);
          }
          .mapboxgl-popup-tip {
            border-top-color: rgb(17, 24, 39);
          }
        `
      }} />
    </div>
  );
};

export default TacticalMapbox;