import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDroneEcosystem } from '@/hooks/use-drone-ecosystem';
import { supabase } from '@/integrations/supabase/client';
import WeatherWidget from '@/components/WeatherWidget';
import { Loader2, MapPin, Zap } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function GlobalMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapToken, setMapToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);
  const { drones, missions, telemetry } = useDroneEcosystem();

  // Fetch Mapbox token
  useEffect(() => {
    const fetchMapToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapToken(data.token);
        mapboxgl.accessToken = data.token;
      } catch (error) {
        console.error('Failed to fetch map token:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMapToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapToken || !mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [25.4858, 42.7339], // Sofia, Bulgaria
      zoom: 6,
      pitch: 45,
      bearing: 0
    });

    map.current.on('load', () => {
      // Add 3D terrain
      map.current?.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });

      map.current?.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

      // Add buildings layer
      map.current?.addLayer({
        id: 'buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [mapToken]);

  // Update drone markers
  useEffect(() => {
    if (!map.current || !drones.length) return;

    // Remove existing drone markers
    const existingMarkers = document.querySelectorAll('.drone-marker');
    existingMarkers.forEach(marker => marker.remove());

    drones.forEach(drone => {
      if (!drone.location_latitude || !drone.location_longitude) return;

      const el = document.createElement('div');
      el.className = 'drone-marker';
      el.innerHTML = `
        <div class="w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
          <div class="w-2 h-2 bg-white rounded-full ${drone.status === 'online' ? 'animate-pulse' : ''}"></div>
        </div>
      `;

      el.addEventListener('click', () => setSelectedDrone(drone.id));

      // Add popup with drone info
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-2">
            <h3 class="font-bold">${drone.name || 'Drone'}</h3>
            <p class="text-sm">Status: ${drone.status}</p>
            <p class="text-sm">Battery: ${drone.battery_level || 0}%</p>
            <p class="text-sm">Altitude: ${drone.altitude_meters || 0}m</p>
          </div>
        `);

      new mapboxgl.Marker(el)
        .setLngLat([drone.location_longitude, drone.location_latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
  }, [drones]);

  const flyToDrone = (drone: any) => {
    if (!map.current || !drone.location_latitude || !drone.location_longitude) return;

    map.current.flyTo({
      center: [drone.location_longitude, drone.location_latitude],
      zoom: 15,
      pitch: 60,
      bearing: 0,
      duration: 2000
    });
    setSelectedDrone(drone.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading global map...</span>
      </div>
    );
  }

  if (!mapToken) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Map Configuration Required</h3>
          <p className="text-muted-foreground">
            Mapbox token is required to display the global map. Please configure it in the settings.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Global Operations Map</h2>
        <div className="flex gap-2">
          <Badge variant="outline">
            <MapPin className="w-3 h-3 mr-1" />
            {drones.length} Drones
          </Badge>
          <Badge variant="outline">
            <Zap className="w-3 h-3 mr-1" />
            {missions.filter(m => m.status === 'active').length} Active Missions
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <Card className="h-[600px] overflow-hidden">
            <div ref={mapContainer} className="w-full h-full" />
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Active Drones</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {drones.map(drone => (
                <div 
                  key={drone.id}
                  className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedDrone === drone.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => flyToDrone(drone)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{drone.name || 'Drone'}</span>
                    <Badge 
                      variant={drone.status === 'online' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {drone.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Battery: {drone.battery_level || 0}%
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3">Mission Status</h3>
            <div className="space-y-2">
              {missions.slice(0, 3).map(mission => (
                <div key={mission.id} className="p-2 rounded-lg bg-muted">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{mission.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {mission.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <WeatherWidget lat={42.7339} lon={25.4858} />
        </div>
      </div>
    </div>
  );
}