import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Drone } from '@/hooks/use-drones';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Wifi, RotateCcw } from 'lucide-react';

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

  // Простая и надежная инициализация карты
  useEffect(() => {
    // Если карта уже создана, не создаваем заново
    if (map.current) return;

    // Устанавливаем валидный токен Mapbox
    mapboxgl.accessToken = 'pk.eyJ1IjoiaGlnaHRlY2hhaSIsImEiOiJjbWViZTBoaW0wbzVwMmpxdmFpeTVnbWdsIn0.8-x4oZ4TfetTTa5BEAXDYg';

    // Простая функция инициализации
    const initMap = () => {
      console.log('🔄 Начинаем инициализацию карты...');
      console.log('🔍 mapContainer.current:', mapContainer.current);
      console.log('🔍 mapContainer type:', typeof mapContainer.current);
      
      const container = mapContainer.current;
      if (!container) {
        console.error('❌ mapContainer.current === null/undefined');
        setError('Контейнер карты недоступен');
        setLoading(false);
        return;
      }

      console.log('✅ Контейнер найден, создаем карту...');

      try {
        // Создаем карту
        const mapInstance = new mapboxgl.Map({
          container: container,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [26.8916, 43.3968],
          zoom: 8
        });

        // Добавляем контролы
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // События карты
        mapInstance.on('load', () => {
          console.log('✅ Карта загружена успешно');
          setLoading(false);
          setError(null);
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
    };

    // Ждем 500ms для рендеринга модального окна
    const timer = setTimeout(initMap, 500);

    return () => {
      clearTimeout(timer);
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

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
        <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg"
             style="background-color: ${color}20; border-color: ${color};">
          <div class="w-3 h-3 rounded-full animate-pulse" style="background-color: ${color};"></div>
        </div>
        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl">
          <div class="font-bold text-white">${drone.name}</div>
          <div class="text-gray-300">Статус: ${drone.status || 'unknown'}</div>
          <div class="text-gray-300">Батарея: ${drone.battery_level || 0}%</div>
          <div class="text-gray-400 text-xs">
            ${drone.location_lat?.toFixed(4)}, ${drone.location_lon?.toFixed(4)}
          </div>
        </div>
      </div>
    `;
    
    return el;
  };

  // Функция добавления маркеров дронов на карту
  const addDroneMarkers = () => {
    if (!map.current) {
      console.log('⚠️ Карта не готова для добавления маркеров');
      return;
    }

    console.log('📍 Добавляем маркеры дронов...');

    // Очищаем существующие маркеры
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Фильтруем дронов с валидными координатами
    const validDrones = drones.filter(drone => 
      drone.location_lat && 
      drone.location_lon && 
      !isNaN(drone.location_lat) && 
      !isNaN(drone.location_lon)
    );

    console.log(`📊 Найдено ${validDrones.length} дронов с валидными координатами`);

    if (validDrones.length === 0) {
      console.log('⚠️ Нет дронов с валидными координатами для отображения');
      return;
    }

    // Создаем маркеры для каждого дрона
    validDrones.forEach(drone => {
      try {
        const marker = new mapboxgl.Marker({
          element: createDroneMarker(drone),
          anchor: 'center'
        })
        .setLngLat([drone.location_lon!, drone.location_lat!])
        .addTo(map.current!);

        markers.current.push(marker);
        console.log(`✅ Добавлен маркер для ${drone.name}`);
      } catch (err) {
        console.error(`❌ Ошибка создания маркера для ${drone.name}:`, err);
      }
    });

    // Подгоняем вид карты под все маркеры
    try {
      if (validDrones.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        validDrones.forEach(drone => {
          bounds.extend([drone.location_lon!, drone.location_lat!]);
        });
        map.current.fitBounds(bounds, { 
          padding: 80,
          maxZoom: 15
        });
        console.log('🎯 Карта подогнана под все маркеры');
      } else if (validDrones.length === 1) {
        map.current.flyTo({
          center: [validDrones[0].location_lon!, validDrones[0].location_lat!],
          zoom: 12,
          duration: 1000
        });
        console.log('🎯 Карта сосредоточена на единственном дроне');
      }
    } catch (err) {
      console.error('❌ Ошибка подгонки границ карты:', err);
    }
  };

  // Функция сброса вида карты
  const resetMapView = () => {
    if (!map.current) return;
    
    console.log('🔄 Сброс вида карты...');
    addDroneMarkers();
  };

  // Обновление маркеров при изменении дронов
  useEffect(() => {
    if (map.current && !loading && !error) {
      console.log('🔄 Обновление маркеров дронов...');
      addDroneMarkers();
    }
  }, [drones, loading, error]);

  // Состояние ошибки
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

  // Состояние загрузки - НО с контейнером для ref
  if (loading) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        {/* ВАЖНО: Контейнер карты ВСЕГДА должен быть в DOM для ref */}
        <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
        
        {/* Загрузчик поверх контейнера */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-1 rounded-lg">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка тактической карты...</p>
          <p className="text-xs text-muted-foreground mt-1">Инициализация Mapbox...</p>
        </div>
      </div>
    );
  }

  // Основной рендер карты
  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Контейнер карты */}
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      {/* Статус онлайн */}
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="secondary" className="bg-green-600/90 text-white shadow-lg">
          <Wifi className="w-3 h-3 mr-1" />
          Онлайн
        </Badge>
      </div>

      {/* Информация о дронах */}
      <div className="absolute top-4 left-4 mt-10 z-10">
        <Badge variant="outline" className="bg-surface-1/90 text-foreground shadow-lg">
          📍 {drones.length} дронов
        </Badge>
      </div>

      {/* Кнопка сброса вида */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={resetMapView}
          className="px-3 py-2 bg-surface-2/90 hover:bg-surface-3 text-foreground border border-border rounded-md transition-colors text-sm shadow-lg flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Сбросить вид
        </button>
      </div>

      {/* Стили для маркеров */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .drone-marker {
            cursor: pointer;
            z-index: 10;
          }
          .drone-marker:hover {
            z-index: 50;
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
          .mapboxgl-ctrl-group {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 8px;
          }
        `
      }} />
    </div>
  );
};

export default TacticalMapbox;