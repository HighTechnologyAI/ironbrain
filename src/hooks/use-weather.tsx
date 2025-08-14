import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WeatherData {
  temperature: number;
  wind_speed: number;
  wind_direction: number;
  visibility: number;
  pressure: number;
  humidity: number;
  weather_condition: string;
  location: string;
}

export const useWeather = (lat?: number, lon?: number) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.functions.invoke('get-weather', {
          body: { 
            lat: lat || 43.388944,  // Timarevo Airfield coordinates
            lon: lon || 26.885444 
          }
        });

        if (error) throw error;

        setWeather(data);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        
        // Set fallback data
        setWeather({
          temperature: 12,
          wind_speed: 7,
          wind_direction: 45,
          visibility: 8.5,
          pressure: 1013,
          humidity: 65,
          weather_condition: 'ясно',
          location: 'Timarevo Airfield'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    
    // Auto-refresh every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [lat, lon]);

  const getWindDirection = (degrees: number): string => {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  return { weather, loading, error, getWindDirection };
};