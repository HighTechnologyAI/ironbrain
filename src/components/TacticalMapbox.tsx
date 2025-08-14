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
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Создание HTML-элемента маркера для дрона
  const createDroneMarker = (drone: Drone) => {
    const el = document.createElement('div');
    el.className = 'drone-marker';
    
    const isOnline = drone.status !== 'offline' && drone.last_contact && 
      new Date().getTime() - new Date(drone.last_contact).getTime() < 5 * 60 * 1000; // 5 минут
    
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
        <div class="w-10 h-10 rounded-full border-2 flex items-center justify-center relative transition-all duration-300 hover:scale-125 hover:shadow-lg"
             style="background: ${color}15; border-color: ${color}; box-shadow: 0 0 20px ${color}40;">
          
          <!-- Основной маркер дрона -->
          <div class="w-4 h-4 rounded-full transition-all duration-300 relative"
               style="background: ${color}; box-shadow: 0 0 12px ${color};">
            <!-- Пульсирующий эффект для онлайн дронов -->
            ${isOnline ? `
              <div class="absolute inset-0 w-4 h-4 rounded-full animate-ping"
                   style="background: ${color}80;">
              </div>
            ` : ''}
          </div>
          
          <!-- Индикатор статуса -->
          ${isOnline ? `
            <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-background"
                 style="background: ${color}; box-shadow: 0 0 8px ${color};">
            </div>
          ` : `
            <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full border border-background bg-gray-500">
            </div>
          `}
          
          <!-- Батарея индикатор -->
          ${drone.battery_level ? `
            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-white bg-black/80 px-1 rounded"
                 style="color: ${drone.battery_level > 30 ? '#00ff41' : drone.battery_level > 15 ? '#ffff00' : '#ff0000'}">
              ${Math.round(drone.battery_level)}%
            </div>
          ` : ''}
        </div>
        
        <!-- Расширенный tooltip -->
        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-black/95 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border border-cyan-400/30">
          <div class="space-y-2">
            <div class="font-bold text-cyan-400 text-lg">${drone.name}</div>
            <div class="text-gray-300">${drone.model || 'Неизвестная модель'}</div>
            
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full" style="background: ${color}"></span>
              <span class="capitalize font-medium">${drone.status}</span>
            </div>
            
            ${drone.battery_level ? `
              <div class="flex items-center gap-2 text-sm">
                <span class="text-cyan-400">🔋</span>
                <span style="color: ${drone.battery_level > 30 ? '#00ff41' : drone.battery_level > 15 ? '#ffff00' : '#ff0000'}">
                  ${Math.round(drone.battery_level)}%
                </span>
              </div>
            ` : ''}
            
            ${drone.last_contact ? `
              <div class="text-xs text-gray-400 border-t border-gray-600 pt-2">
                Последний контакт: ${new Date(drone.last_contact).toLocaleString('ru-RU')}
              </div>
            ` : ''}
            
            ${drone.serial ? `
              <div class="text-xs text-gray-500">S/N: ${drone.serial}</div>
            ` : ''}
          </div>
          
          <!-- Стрелка tooltip -->
          <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/95"></div>
        </div>
      </div>
    `;
    
    return el;
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Получаем токен из Supabase edge function
    const initializeMap = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🗺️ Инициализация карты...');
        
        // Получаем токен через edge function с таймаутом
        console.log('📡 Вызов get-mapbox-token edge function...');
        
        const { data, error } = await Promise.race([
          supabase.functions.invoke('get-mapbox-token'),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000)
          )
        ]) as any;
        
        console.log('📡 Ответ edge function:', { data, error });
        
        if (error) {
          console.error('❌ Ошибка edge function:', error);
          setError('Ошибка получения Mapbox токена: ' + error.message);
          setLoading(false);
          return;
        }

        if (!data?.token) {
          console.error('❌ Токен не найден в ответе:', data);
          setError('Mapbox токен не найден в ответе сервера');
          setLoading(false);
          return;
        }

        const token = data.token;
        console.log('✅ Токен получен успешно');
        setMapboxToken(token);
        mapboxgl.accessToken = token;

        console.log('🗺️ Создание экземпляра карты...');
        // Инициализируем карту с кибер-стилем
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11', // Темная тема
          center: [26.8855, 43.3889], // Timarevo Airfield, Bulgaria
          zoom: 8,
          pitch: 45,
          bearing: 0,
          antialias: true
        });

        console.log('🗺️ Добавление контролов навигации...');
        // Добавляем контролы навигации
        map.current.addControl(
          new mapboxgl.NavigationControl({
            visualizePitch: true,
          }),
          'top-right'
        );

        // Таймаут для загрузки карты
        const loadTimeout = setTimeout(() => {
          console.error('⏰ Таймаут загрузки карты');
          setError('Таймаут загрузки карты. Попробуйте еще раз.');
          setLoading(false);
        }, 15000);

        // Кастомизация стиля карты для кибер-эффекта
        map.current.on('style.load', () => {
          console.log('🎨 Стиль карты загружен');
          clearTimeout(loadTimeout);
          
          if (!map.current) return;
          
          try {
            // Добавляем туман для кибер-эффекта
            map.current.setFog({
              color: 'rgb(20, 20, 40)',
              'high-color': 'rgb(0, 255, 255)',
              'horizon-blend': 0.1,
              'space-color': 'rgb(0, 0, 20)',
              'star-intensity': 0.8
            });

            // Меняем цвета на кибер-палитру
            if (map.current.getLayer('water')) {
              map.current.setPaintProperty('water', 'fill-color', '#001122');
            }
            if (map.current.getLayer('land')) {
              map.current.setPaintProperty('land', 'fill-color', '#0a0a0f');
            }
          } catch (err) {
            console.warn('⚠️ Ошибка кастомизации стиля:', err);
          }
          
          console.log('✅ Карта готова к использованию');
          setLoading(false);
        });

        map.current.on('error', (e) => {
          console.error('❌ Ошибка Mapbox:', e);
          clearTimeout(loadTimeout);
          
          if (e.error?.message?.includes('401')) {
            setError('Неверный Mapbox токен. Проверьте настройки.');
          } else {
            setError('Ошибка загрузки карты: ' + (e.error?.message || 'неизвестная ошибка'));
          }
          setLoading(false);
        });

        map.current.on('load', () => {
          console.log('🗺️ Карта полностью загружена');
          clearTimeout(loadTimeout);
          setLoading(false);
        });

      } catch (err) {
        console.error('❌ Ошибка инициализации карты:', err);
        if (err instanceof Error && err.message === 'Timeout') {
          setError('Таймаут получения токена. Проверьте подключение к интернету.');
        } else {
          setError('Ошибка инициализации карты: ' + (err instanceof Error ? err.message : 'неизвестная ошибка'));
        }
        setLoading(false);
      }
    };

    initializeMap();

    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, []);

  // Обновляем маркеры дронов
  useEffect(() => {
    if (!map.current || loading) return;

    // Удаляем старые маркеры
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Добавляем новые маркеры для дронов с координатами
    drones.forEach(drone => {
      if (drone.location_lat && drone.location_lon) {
        const markerElement = createDroneMarker(drone);
        
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([drone.location_lon, drone.location_lat])
          .addTo(map.current!);

        // Обработчик клика на маркер
        markerElement.addEventListener('click', () => {
          if (map.current) {
            map.current.flyTo({
              center: [drone.location_lon!, drone.location_lat!],
              zoom: 15,
              pitch: 60,
              duration: 2000
            });
          }
        });

        markers.current.push(marker);
      }
    });

    // Автоматически подгоняем карту под все дроны
    if (drones.length > 0) {
      const dronesWithLocation = drones.filter(d => d.location_lat && d.location_lon);
      if (dronesWithLocation.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        dronesWithLocation.forEach(drone => {
          bounds.extend([drone.location_lon!, drone.location_lat!]);
        });
        
        if (map.current) {
          map.current.fitBounds(bounds, {
            padding: 50,
            maxZoom: 15
          });
        }
      }
    }
  }, [drones, loading]);

  const resetView = () => {
    if (map.current) {
      map.current.flyTo({
        center: [26.8855, 43.3889],
        zoom: 10,
        pitch: 45,
        bearing: 0,
        duration: 2000
      });
    }
  };

  if (error) {
    return (
      <div className={`h-64 bg-surface-2 rounded-lg flex items-center justify-center border border-border ${className}`}>
        <div className="text-center max-w-md">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-2" />
          <p className="text-destructive font-ui mb-2 text-sm">{error}</p>
          <p className="text-xs text-muted-foreground">
            Проверьте настройку MAPBOX_PUBLIC_TOKEN в Supabase Edge Function Secrets
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`h-64 bg-surface-2 rounded-lg flex items-center justify-center border border-border ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-2" />
          <p className="text-muted-foreground font-ui">Загрузка тактической карты...</p>
        </div>
      </div>
    );
  }

  const onlineDrones = drones.filter(d => d.status !== 'offline').length;
  const offlineDrones = drones.length - onlineDrones;

  return (
    <div className={`relative ${className}`}>
      {/* Статистика дронов */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Badge variant="secondary" className="bg-black/80 text-cyan-400 border-cyan-400/50">
          <Wifi className="h-3 w-3 mr-1" />
          {onlineDrones} онлайн
        </Badge>
        <Badge variant="secondary" className="bg-black/80 text-gray-400 border-gray-400/50">
          <WifiOff className="h-3 w-3 mr-1" />
          {offlineDrones} офлайн
        </Badge>
      </div>

      {/* Кнопки управления картой */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={resetView}
          className="px-3 py-2 bg-black/80 text-cyan-400 border border-cyan-400/50 rounded text-sm hover:bg-cyan-400/20 transition-colors backdrop-blur-sm"
        >
          🎯 Базовый вид
        </button>
        
        <button
          onClick={() => {
            if (map.current) {
              map.current.flyTo({
                zoom: map.current.getZoom() + 1,
                duration: 1000
              });
            }
          }}
          className="px-3 py-2 bg-black/80 text-cyan-400 border border-cyan-400/50 rounded text-sm hover:bg-cyan-400/20 transition-colors backdrop-blur-sm"
        >
          🔍 Приблизить
        </button>
        
        <button
          onClick={() => {
            if (map.current) {
              map.current.flyTo({
                zoom: Math.max(map.current.getZoom() - 1, 1),
                duration: 1000
              });
            }
          }}
          className="px-3 py-2 bg-black/80 text-cyan-400 border border-cyan-400/50 rounded text-sm hover:bg-cyan-400/20 transition-colors backdrop-blur-sm"
        >
          🔍 Отдалить
        </button>
      </div>

      {/* Контейнер карты */}
      <div ref={mapContainer} className="h-64 rounded-lg border border-border" />
      
      <style>{`
        .drone-marker {
          user-select: none;
          -webkit-user-select: none;
        }
        
        .drone-marker:hover {
          z-index: 1000;
        }
        
        /* Анимация для пульсирующих маркеров */
        @keyframes drone-pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .drone-marker .animate-ping {
          animation: drone-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default TacticalMapbox;