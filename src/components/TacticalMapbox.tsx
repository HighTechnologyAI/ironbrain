import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Drone } from '@/hooks/use-drones';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const loadingRef = useRef(true);

  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  
  // Получение токена Mapbox из Edge Function
  useEffect(() => {
    const fetchToken = async () => {
      try {
        console.log('🔑 [TOKEN] Получаем токен Mapbox через Supabase...');
        
        // Используем Supabase client для вызова Edge Function
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('❌ [TOKEN] Ошибка Supabase функции:', error);
          throw error;
        }
        
        if (data && data.success && data.token) {
          console.log('✅ [TOKEN] Токен получен успешно через Supabase');
          setMapboxToken(data.token);
        } else {
          console.error('❌ [TOKEN] Ошибка получения токена:', data?.error);
          // Используем fallback токен
          console.log('🔄 [TOKEN] Используем fallback токен');
          setMapboxToken('pk.eyJ1IjoiaGlnaHRlY2hhaSIsImEiOiJjbWViZTBoaW0wbzVwMmpxdmFpeTVnbWdsIn0.8-x4oZ4TfetTTa5BEAXDYg');
        }
      } catch (err) {
        console.error('❌ [TOKEN] Ошибка запроса токена:', err);
        console.log('🔄 [TOKEN] Используем fallback токен из-за ошибки');
        // Используем fallback токен при ошибке
        setMapboxToken('pk.eyJ1IjoiaGlnaHRlY2hhaSIsImEiOiJjbWViZTBoaW0wbzVwMmpxdmFpeTVnbWdsIn0.8-x4oZ4TfetTTa5BEAXDYg');
      }
    };
    
    fetchToken();
  }, []); // Токен получаем только при монтировании

  // Отслеживание изменений loading
  useEffect(() => {
    console.log('🔄 [LOADING STATE] loading изменился на:', loading);
    loadingRef.current = loading;
  }, [loading]);

  // Создание HTML-элемента маркера для дрона
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
             style="background: ${color}; border-color: #fff; box-shadow: 0 0 10px ${color};">
          <div class="text-white text-xs font-bold">${drone.name.slice(-2)}</div>
        </div>
        
        <!-- Tooltip -->
        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
          <div class="font-bold">${drone.name}</div>
          <div>Статус: ${drone.status.toUpperCase()}</div>
          <div>Батарея: ${Math.round(drone.battery_level)}%</div>
          ${drone.model ? `<div>Модель: ${drone.model}</div>` : ''}
        </div>
      </div>
    `;
    
    return el;
  };

  // Основной useEffect для инициализации карты
  useEffect(() => {
    console.log('🔄 [EFFECT] useEffect запущен');
    console.log('🔄 [EFFECT] mapContainer.current:', !!mapContainer.current);
    console.log('🔄 [EFFECT] mapboxToken:', !!mapboxToken);
    console.log('🔄 [EFFECT] map.current:', !!map.current);
    console.log('🔄 [EFFECT] loading:', loading);
    
    if (map.current) {
      console.log('🔄 [EFFECT] Карта уже инициализирована, пропускаем');
      return;
    }

    if (!mapboxToken) {
      console.log('⏳ [EFFECT] mapboxToken отсутствует, ждем получения токена');
      return;
    }

    // Проверяем готовность DOM элемента с задержкой
    const checkAndInitialize = () => {
      console.log('🔍 [CHECK] Проверяем готовность mapContainer...');
      if (mapContainer.current) {
        console.log('✅ [CHECK] mapContainer готов, инициализируем карту');
        initializeMap();
      } else {
        console.log('⏳ [CHECK] mapContainer не готов, повторная проверка через 100ms');
        setTimeout(checkAndInitialize, 100);
      }
    };

    // Запускаем проверку с небольшой задержкой чтобы дать DOM отрендериться
    setTimeout(checkAndInitialize, 50);

    const initializeMap = () => {
      console.log('🗺️ [INIT] Начинаем инициализацию карты');
      console.log('🗺️ [INIT] mapContainer.current есть:', !!mapContainer.current);
      console.log('🗺️ [INIT] mapboxToken есть:', !!mapboxToken);
      console.log('🗺️ [INIT] mapboxToken значение:', mapboxToken?.substring(0, 20) + '...');
      
      if (!mapContainer.current) {
        console.log('❌ [INIT] mapContainer.current не доступен');
        return;
      }

      if (!mapboxToken) {
        console.log('❌ [INIT] mapboxToken не доступен');
        return;
      }

      console.log('🗺️ [INIT] Устанавливаем токен доступа');
      
      // Используем токен из state
      mapboxgl.accessToken = mapboxToken;
        
      try {
        console.log('🗺️ [CREATE] Создаем карту...');
        console.log('🗺️ [CONTAINER] Контейнер готов:', !!mapContainer.current);
        console.log('🗺️ [MAPBOX] mapboxgl доступен:', !!mapboxgl);
        console.log('🗺️ [ACCESS_TOKEN] accessToken установлен:', !!mapboxgl.accessToken);
        
        const mapInstance = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [26.8916, 43.3968], // Центр Болгарии
          zoom: 8,
          projection: 'mercator'
        });

        console.log('🗺️ [INSTANCE] Экземпляр карты создан:', !!mapInstance);

        // Добавляем контролы навигации
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Обработчики событий
        mapInstance.on('load', () => {
          console.log('✅ [SUCCESS] Карта загружена успешно!');
          console.log('🔄 [STATE] Устанавливаем loading = false');
          map.current = mapInstance;
          
          // Принудительно сбрасываем loading
          console.log('🔄 [BEFORE] loading состояние перед сбросом:', loading);
          setLoading(false);
          loadingRef.current = false;
          console.log('🔄 [AFTER] Вызвали setLoading(false)');
          
          // Проверяем что состояние сброшено
          setTimeout(() => {
            console.log('🔍 [CHECK] Проверяем состояние loading через 200ms:', loadingRef.current);
            addDroneMarkers();
          }, 200);
        });
        
        
        mapInstance.on('error', (e) => {
          console.error('❌ [ERROR] Ошибка карты:', e);
          console.error('❌ [ERROR] Детали ошибки:', e.error);
          console.error('❌ [ERROR] Тип ошибки:', typeof e.error);
          setError(`Ошибка загрузки карты: ${e.error?.message || JSON.stringify(e.error) || 'Неизвестная ошибка'}`);
          setLoading(false);
        });

        // Дополнительные события для отладки
        mapInstance.on('styleload', () => {
          console.log('🎨 [STYLE] Стиль карты загружен');
        });

        mapInstance.on('idle', () => {
          console.log('💤 [IDLE] Карта в состоянии idle');
        });

        const renderHandler = () => {
          console.log('🖼️ [RENDER] Карта отрендерена (только первый раз)');
          mapInstance.off('render', renderHandler);
        };
        
        mapInstance.on('render', renderHandler);
        
      } catch (err) {
        console.error('💥 [CRITICAL] Критическая ошибка инициализации:', err);
        setError(err instanceof Error ? err.message : 'Критическая ошибка');
        setLoading(false);
      }
    };

    // Добавление маркеров дронов
    const addDroneMarkers = () => {
      console.log('📍 [MARKERS START] Проверяем карту и дроны...');
      console.log('📍 [MAP STATE] map.current существует:', !!map.current);
      console.log('📍 [DRONES COUNT] Количество дронов:', drones.length);
      
      if (!map.current) {
        console.error('❌ [MARKERS ERROR] Карта не инициализирована!');
        return;
      }
      
      console.log('📍 [MARKERS] Добавляем маркеры дронов...', drones.length);
      
      // Очищаем старые маркеры
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      
      // Добавляем новые маркеры
      const validDrones = drones.filter(drone => 
        drone.location_lat && 
        drone.location_lon && 
        !isNaN(drone.location_lat) && 
        !isNaN(drone.location_lon)
      );
      
      console.log('📍 [VALID] Валидных дронов с координатами:', validDrones.length);
      
      validDrones.forEach(drone => {
        const el = createDroneMarker(drone);
        
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([drone.location_lon, drone.location_lat])
          .addTo(map.current!);
        
        markers.current.push(marker);
        
        console.log(`📍 [DRONE] Добавлен маркер для ${drone.name} на [${drone.location_lat}, ${drone.location_lon}]`);
      });
      
      // Подгоняем вид под все маркеры
      if (validDrones.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        validDrones.forEach(drone => {
          bounds.extend([drone.location_lon, drone.location_lat]);
        });
        
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 12
        });
      }
    };

    initializeMap();

    return () => {
      console.log('🧹 [CLEANUP] Очистка карты...');
      markers.current.forEach(marker => marker.remove());
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]); // Инициализируем когда получим токен

  // Обновление маркеров при изменении дронов
  useEffect(() => {
    if (map.current && !loading) {
      console.log('🔄 [UPDATE] Обновляем маркеры дронов...');
      
      // Очищаем старые маркеры
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      
      // Добавляем новые маркеры
      const validDrones = drones.filter(drone => 
        drone.location_lat && 
        drone.location_lon && 
        !isNaN(drone.location_lat) && 
        !isNaN(drone.location_lon)
      );
      
      validDrones.forEach(drone => {
        const el = createDroneMarker(drone);
        
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([drone.location_lon, drone.location_lat])
          .addTo(map.current!);
        
        markers.current.push(marker);
      });
    }
  }, [drones, loading]);

  const resetView = () => {
    if (!map.current) return;
    
    map.current.flyTo({
      center: [26.8916, 43.3968],
      zoom: 8,
      duration: 1000
    });
  };

  if (error) {
    return (
      <div className={`relative w-full h-full min-h-[400px] bg-surface-1 rounded-lg border border-border ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Ошибка загрузки карты</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Перезагрузить
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    console.log('🔄 [RENDER] Показываем экран загрузки, loading =', loading);
    return (
      <div className={`relative w-full h-full min-h-[400px] bg-surface-1 rounded-lg border border-border ${className}`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">Загрузка тактической карты...</p>
          <p className="text-xs text-muted-foreground mt-2">Инициализация Mapbox...</p>
        </div>
      </div>
    );
  }

  console.log('🗺️ [RENDER] Рендерим карту, loading =', loading);

  return (
    <div className={`relative w-full h-full min-h-[400px] ${className}`}>
      {/* Статистика дронов */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
          <Wifi className="h-3 w-3 mr-1" />
          Online: {drones.filter(d => d.status !== 'offline').length}
        </Badge>
        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
          <WifiOff className="h-3 w-3 mr-1" />
          Offline: {drones.filter(d => d.status === 'offline').length}
        </Badge>
      </div>

      {/* Контролы карты */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={resetView}
          className="px-3 py-2 bg-background/80 backdrop-blur-sm border border-border rounded-lg text-sm hover:bg-background/90 transition-colors"
        >
          Сбросить вид
        </button>
      </div>

      {/* Контейнер карты */}
      <div ref={mapContainer} className="absolute inset-0 rounded-lg overflow-hidden" />
      
      {/* Кастомные стили для маркеров */}
      <style>{`
        .drone-marker {
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .drone-marker:hover {
          transform: scale(1.1);
          z-index: 1000;
        }
        .mapboxgl-popup {
          z-index: 1001;
        }
        .mapboxgl-popup-content {
          background: rgba(0, 0, 0, 0.9);
          color: white;
          border-radius: 8px;
          padding: 12px;
          font-size: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip {
          border-top-color: rgba(0, 0, 0, 0.9);
        }
        .mapboxgl-popup-anchor-top .mapboxgl-popup-tip {
          border-bottom-color: rgba(0, 0, 0, 0.9);
        }
      `}</style>
    </div>
  );
};

export default TacticalMapbox;