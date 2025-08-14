import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/neon/Button';
import { MapPin, AlertTriangle } from 'lucide-react';

interface MapComponentProps {
  telemetryData?: {
    lat: number;
    lon: number;
    alt: number;
    heading?: number;
  };
  waypoints?: Array<{
    lat: number;
    lon: number;
    name?: string;
  }>;
  className?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  telemetryData, 
  waypoints = [], 
  className = "h-96" 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [mapInitialized, setMapInitialized] = useState(false);

  // Check for Mapbox token from environment
  useEffect(() => {
    const envToken = import.meta.env.VITE_MAPBOX_TOKEN;
    if (envToken) {
      setMapboxToken(envToken);
    }
  }, []);

  // Initialize map when token is available
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || mapInitialized) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      const initialCenter: [number, number] = telemetryData 
        ? [telemetryData.lon, telemetryData.lat]
        : [23.3219, 42.6977]; // Sofia, Bulgaria default

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: initialCenter,
        zoom: telemetryData ? 15 : 8,
        pitch: 45,
        bearing: telemetryData?.heading || 0,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      setMapInitialized(true);

      // Cleanup function
      return () => {
        map.current?.remove();
        setMapInitialized(false);
      };
    } catch (error) {
      console.error('Failed to initialize Mapbox:', error);
    }
  }, [mapboxToken, mapInitialized]);

  // Update UAV position marker
  useEffect(() => {
    if (!map.current || !telemetryData || !mapInitialized) return;

    const uavMarkerId = 'uav-position';
    
    // Remove existing marker
    if (map.current.getSource(uavMarkerId)) {
      map.current.removeLayer(uavMarkerId);
      map.current.removeSource(uavMarkerId);
    }

    // Add UAV position
    map.current.addSource(uavMarkerId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [telemetryData.lon, telemetryData.lat]
          },
          properties: {
            title: 'UAV Position',
            altitude: telemetryData.alt,
            heading: telemetryData.heading || 0
          }
        }]
      }
    });

    map.current.addLayer({
      id: uavMarkerId,
      type: 'circle',
      source: uavMarkerId,
      paint: {
        'circle-radius': 8,
        'circle-color': '#16C172',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Add popup on click
    map.current.on('click', uavMarkerId, (e) => {
      if (!e.features?.[0]) return;
      
      const feature = e.features[0];
      const coordinates = (feature.geometry as any).coordinates.slice();
      const { altitude, heading } = feature.properties!;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">UAV Position</h3>
            <p class="text-xs">Alt: ${altitude}m</p>
            <p class="text-xs">Heading: ${heading}°</p>
          </div>
        `)
        .addTo(map.current!);
    });

    // Center map on UAV
    map.current.flyTo({
      center: [telemetryData.lon, telemetryData.lat],
      zoom: 15,
      bearing: telemetryData.heading || 0,
      duration: 1000
    });
  }, [telemetryData, mapInitialized]);

  // Add waypoints
  useEffect(() => {
    if (!map.current || !waypoints.length || !mapInitialized) return;

    const waypointsId = 'waypoints';
    
    // Remove existing waypoints
    if (map.current.getSource(waypointsId)) {
      map.current.removeLayer(waypointsId);
      map.current.removeSource(waypointsId);
    }

    // Add waypoints
    map.current.addSource(waypointsId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: waypoints.map((wp, index) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [wp.lon, wp.lat]
          },
          properties: {
            title: wp.name || `Waypoint ${index + 1}`,
            index: index + 1
          }
        }))
      }
    });

    map.current.addLayer({
      id: waypointsId,
      type: 'circle',
      source: waypointsId,
      paint: {
        'circle-radius': 6,
        'circle-color': '#F6C945',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Add waypoint labels
    map.current.addLayer({
      id: `${waypointsId}-labels`,
      type: 'symbol',
      source: waypointsId,
      layout: {
        'text-field': ['get', 'index'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': 10,
        'text-anchor': 'center'
      },
      paint: {
        'text-color': '#000000'
      }
    });
  }, [waypoints, mapInitialized]);

  const handleTokenSubmit = () => {
    if (tokenInput.trim()) {
      setMapboxToken(tokenInput.trim());
    }
  };

  if (!mapboxToken) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Flight Map Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Mapbox Token Required</p>
              <p className="text-muted-foreground">
                Enter your Mapbox public token to enable the flight map.
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Mapbox Public Token</label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIi..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="font-mono text-xs"
              />
              <Button onClick={handleTokenSubmit} variant="neon" size="sm">
                Apply
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your token from{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                mapbox.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="absolute inset-0 rounded-lg overflow-hidden" />
      {!mapInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-1 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;