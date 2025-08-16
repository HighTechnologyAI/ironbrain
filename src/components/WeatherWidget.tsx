import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Wind, Thermometer, Droplets, Eye, Gauge } from 'lucide-react';

interface WeatherData {
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  weather: string;
  description: string;
}

interface WeatherWidgetProps {
  lat?: number;
  lon?: number;
  className?: string;
}

export default function WeatherWidget({ lat = 42.7339, lon = 25.4858, className }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('get-weather', {
          body: { lat, lon }
        });

        if (error) throw error;
        setWeather(data);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Failed to load weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lon]);

  if (loading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-20 mb-2"></div>
          <div className="h-6 bg-muted rounded w-16"></div>
        </div>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className={`p-4 ${className}`}>
        <h3 className="font-semibold mb-2">Weather</h3>
        <p className="text-sm text-muted-foreground">Data unavailable</p>
      </Card>
    );
  }

  const getWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
  };

  const getWeatherStatus = (main: string) => {
    switch (main.toLowerCase()) {
      case 'clear': return { variant: 'default' as const, text: 'Clear' };
      case 'clouds': return { variant: 'secondary' as const, text: 'Cloudy' };
      case 'rain': return { variant: 'destructive' as const, text: 'Rain' };
      case 'snow': return { variant: 'outline' as const, text: 'Snow' };
      default: return { variant: 'outline' as const, text: main };
    }
  };

  const status = getWeatherStatus(weather.weather);

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Weather</h3>
        <Badge variant={status.variant}>
          {status.text}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">{Math.round(weather.temperature)}°C</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            {Math.round(weather.windSpeed * 3.6)} km/h {getWindDirection(weather.windDirection)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{weather.humidity}% humidity</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{weather.pressure} hPa</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{(weather.visibility / 1000).toFixed(1)} km</span>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2 capitalize">
        {weather.description}
      </p>
    </Card>
  );
}