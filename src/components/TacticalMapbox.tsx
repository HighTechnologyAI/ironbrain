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
        <div class="w-8 h-8 rounded-full border-2 flex items-center justify-center relative transition-all duration-300 hover:scale-110"
             style="background: ${color}20; border-color: ${color}; box-shadow: 0 0 15px ${color}50;">
          <div class="w-3 h-3 rounded-full transition-all duration-300"
               style="background: ${color}; box-shadow: 0 0 8px ${color};">
          </div>
          ${isOnline ? `
            <div class="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                 style="background: ${color}; box-shadow: 0 0 6px ${color};">
            </div>
          ` : ''}
        </div>
        
        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
          <div class="font-bold text-cyan-400">${drone.name}</div>
          <div class="text-gray-300">${drone.model}</div>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-xs" style="color: ${color}">●</span>
            <span class="capitalize">${drone.status}</span>
          </div>
          ${drone.battery_level ? `
            <div class="flex items-center gap-1 text-xs">
              🔋 ${Math.round(drone.battery_level)}%
            </div>
          ` : ''}
          <div class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
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
        
        // Получаем токен через edge function
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Edge function error:', error);
          setError('Ошибка получения Mapbox токена: ' + error.message);
          setLoading(false);
          return;
        }

        if (!data?.token) {
          setError('Mapbox токен не настроен в системе');
          setLoading(false);
          return;
        }

        const token = data.token;
        setMapboxToken(token);
        mapboxgl.accessToken = token;

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

        // Добавляем контролы навигации
        map.current.addControl(
          new mapboxgl.NavigationControl({
            visualizePitch: true,
          }),
          'top-right'
        );

        // Кастомизация стиля карты для кибер-эффекта
        map.current.on('style.load', () => {
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
            console.warn('Style customization error:', err);
          }
          
          setLoading(false);
        });

        map.current.on('error', (e) => {
          console.error('Mapbox error:', e);
          if (e.error?.message?.includes('401')) {
            setError('Неверный Mapbox токен. Проверьте настройки.');
          } else {
            setError('Ошибка загрузки карты: ' + (e.error?.message || 'неизвестная ошибка'));
          }
          setLoading(false);
        });

        map.current.on('load', () => {
          setLoading(false);
        });

      } catch (err) {
        console.error('Map initialization error:', err);
        setError('Ошибка инициализации карты: ' + (err instanceof Error ? err.message : 'неизвестная ошибка'));
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

      {/* Кнопка сброса вида */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={resetView}
          className="px-3 py-1 bg-black/80 text-cyan-400 border border-cyan-400/50 rounded text-sm hover:bg-cyan-400/20 transition-colors"
        >
          Базовый вид
        </button>
      </div>

      {/* Контейнер карты */}
      <div ref={mapContainer} className="h-64 rounded-lg" />
      
      <style>{`
        .drone-marker {
          user-select: none;
          -webkit-user-select: none;
        }
      `}</style>
    </div>
  );
};

export default TacticalMapbox;