import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map as MapIcon, Layers, Navigation, Satellite, MapPin } from 'lucide-react';
import { DroneService } from '@/services/droneService';
import { MissionService } from '@/services/missionService';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapContainerProps {
  height?: string;
  showControls?: boolean;
  selectedDroneId?: string;
  onDroneSelect?: (droneId: string) => void;
}

const MapContainer: React.FC<MapContainerProps> = ({
  height = 'h-96',
  showControls = true,
  selectedDroneId,
  onDroneSelect
}) => {
  const { t } = useTranslation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/satellite-v9');
  const [initialized, setInitialized] = useState(false);
  const markersRef = useRef(new Map<string, mapboxgl.Marker>());

  // Fetch drones and missions data
  const { data: drones } = useQuery({
    queryKey: ['drones'],
    queryFn: () => DroneService.getDrones(),
    select: (data) => data.data || []
  });

  const { data: missions } = useQuery({
    queryKey: ['missions'],
    queryFn: () => MissionService.getMissions(),
    select: (data) => data.data || []
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || initialized) return;

    // Set Mapbox access token from secrets
    mapboxgl.accessToken = 'pk.eyJ1IjoidGlnZXJ0ZWNoIiwiYSI6ImNsdDZhc2JybjE4c3gycXFsNW5mN3lscG4ifQ.placeholder'; // Replace with actual token

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [37.6176, 55.7558], // Moscow coordinates as default
      zoom: 10,
      pitch: 45,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    // Add fullscreen control
    map.current.addControl(
      new mapboxgl.FullscreenControl(),
      'top-right'
    );

    // Add scale control
    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      }),
      'bottom-right'
    );

    setInitialized(true);

    return () => {
      map.current?.remove();
    };
  }, [mapStyle, initialized]);

  // Update drone markers
  useEffect(() => {
    if (!map.current || !drones) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Add new drone markers
    drones.forEach(drone => {
      if (drone.location_latitude && drone.location_longitude) {
        // Create drone marker element
        const el = document.createElement('div');
        el.className = 'drone-marker';
        el.style.cssText = `
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${getDroneColor(drone.status)};
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: all 0.3s ease;
        `;

        // Highlight selected drone
        if (selectedDroneId === drone.id) {
          el.style.transform = 'scale(1.5)';
          el.style.zIndex = '1000';
        }

        // Add click handler
        el.addEventListener('click', () => {
          onDroneSelect?.(drone.id);
        });

        // Create marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat([drone.location_longitude, drone.location_latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-semibold">${drone.name}</h3>
                  <p class="text-sm text-gray-600">${t(`drone.status.${drone.status}`)}</p>
                  <p class="text-xs">Battery: ${drone.battery_level || 0}%</p>
                  <p class="text-xs">Altitude: ${drone.altitude_meters || 0}m</p>
                </div>
              `)
          )
          .addTo(map.current!);

        markersRef.current.set(drone.id, marker);
      }
    });
  }, [drones, selectedDroneId, onDroneSelect, t]);

  // Change map style
  const changeMapStyle = (style: string) => {
    if (map.current) {
      map.current.setStyle(style);
      setMapStyle(style);
    }
  };

  // Fit map to show all drones
  const fitToDrones = () => {
    if (!map.current || !drones) return;

    const activeDrones = drones.filter(d => 
      d.location_latitude && d.location_longitude
    );

    if (activeDrones.length === 0) return;

    if (activeDrones.length === 1) {
      const drone = activeDrones[0];
      map.current.flyTo({
        center: [drone.location_longitude!, drone.location_latitude!],
        zoom: 15
      });
    } else {
      const bounds = new mapboxgl.LngLatBounds();
      activeDrones.forEach(drone => {
        bounds.extend([drone.location_longitude!, drone.location_latitude!]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  };

  const getDroneColor = (status: string) => {
    switch (status) {
      case 'online': return '#10B981'; // green
      case 'mission': return '#F59E0B'; // orange  
      case 'charging': return '#3B82F6'; // blue
      case 'maintenance': return '#8B5CF6'; // purple
      case 'offline': return '#6B7280'; // gray
      default: return '#6B7280';
    }
  };

  const mapStyles = [
    { name: t('map.satellite'), value: 'mapbox://styles/mapbox/satellite-v9', icon: Satellite },
    { name: t('map.streets'), value: 'mapbox://styles/mapbox/streets-v11', icon: MapIcon },
    { name: t('map.terrain'), value: 'mapbox://styles/mapbox/outdoors-v11', icon: Layers }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapIcon className="h-5 w-5" />
            {t('map.title')}
          </CardTitle>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {mapStyles.map(style => {
                  const IconComponent = style.icon;
                  return (
                    <Button
                      key={style.value}
                      variant={mapStyle === style.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => changeMapStyle(style.value)}
                      className="gap-1"
                    >
                      <IconComponent className="h-3 w-3" />
                      <span className="hidden sm:inline">{style.name}</span>
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={fitToDrones}
                className="gap-1"
              >
                <Navigation className="h-3 w-3" />
                <span className="hidden sm:inline">{t('map.fitToDrones')}</span>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          <div ref={mapContainer} className={`w-full ${height} rounded-lg`} />
          
          {/* Drone status legend */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <h4 className="text-sm font-semibold mb-2">{t('map.droneStatus')}</h4>
            <div className="space-y-1">
              {[
                { status: 'online', color: '#10B981', label: t('drone.status.online') },
                { status: 'mission', color: '#F59E0B', label: t('drone.status.mission') },
                { status: 'charging', color: '#3B82F6', label: t('drone.status.charging') },
                { status: 'offline', color: '#6B7280', label: t('drone.status.offline') }
              ].map(item => (
                <div key={item.status} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Active drones count */}
          <div className="absolute bottom-4 left-4">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
              <MapPin className="h-3 w-3 mr-1" />
              {drones?.filter(d => d.location_latitude && d.location_longitude).length || 0} {t('map.activeDrones')}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapContainer;