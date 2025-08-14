import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TelemetryData {
  id: number;
  drone_id: string;
  mission_id?: string;
  ts: string;
  lat: number;
  lon: number;
  alt: number;
  battery_v: number;
  esc_temp_c: number;
  speed_ms: number;
  wind_ms: number;
  payload?: any;
}

// Real-time telemetry hook
export const useRealTimeTelemetry = (droneId?: string) => {
  const [latestData, setLatestData] = useState<TelemetryData | null>(null);

  const { data: telemetryHistory, isLoading } = useQuery({
    queryKey: ['uav-telemetry', droneId],
    queryFn: async () => {
      let query = supabase
        .from('uav_telemetry')
        .select('*')
        .order('ts', { ascending: false })
        .limit(100);

      if (droneId) {
        query = query.eq('drone_id', droneId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TelemetryData[];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('telemetry-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'uav_telemetry',
          ...(droneId ? { filter: `drone_id=eq.${droneId}` } : {})
        },
        (payload) => {
          console.log('New telemetry data:', payload.new);
          setLatestData(payload.new as TelemetryData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [droneId]);

  // Update latest data when history loads
  useEffect(() => {
    if (telemetryHistory && telemetryHistory.length > 0) {
      setLatestData(telemetryHistory[0]);
    }
  }, [telemetryHistory]);

  return {
    latestData,
    telemetryHistory,
    isLoading
  };
};

// Mock telemetry generator for demo purposes
export const useMockTelemetry = (enabled: boolean = false) => {
  const [mockData, setMockData] = useState<TelemetryData | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const baseLocation = { lat: 42.6977, lon: 23.3219 }; // Sofia
      const variation = 0.01;
      
      setMockData({
        id: Date.now(),
        drone_id: 'demo-drone-1',
        ts: new Date().toISOString(),
        lat: baseLocation.lat + (Math.random() - 0.5) * variation,
        lon: baseLocation.lon + (Math.random() - 0.5) * variation,
        alt: 100 + Math.random() * 50,
        battery_v: 14.8 - Math.random() * 2,
        esc_temp_c: 55 + Math.random() * 20,
        speed_ms: 8 + Math.random() * 8,
        wind_ms: 2 + Math.random() * 5,
        payload: {
          gps_quality: Math.floor(Math.random() * 10) + 5,
          satellites: Math.floor(Math.random() * 5) + 8
        }
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [enabled]);

  return mockData;
};

// Telemetry display component
interface TelemetryDisplayProps {
  data: TelemetryData | null;
  className?: string;
}

export const TelemetryDisplay: React.FC<TelemetryDisplayProps> = ({ 
  data, 
  className = "" 
}) => {
  if (!data) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="text-sm text-muted-foreground">No telemetry data available</div>
      </div>
    );
  }

  const telemetryItems = [
    { label: 'Latitude', value: `${data.lat.toFixed(6)}°`, unit: '' },
    { label: 'Longitude', value: `${data.lon.toFixed(6)}°`, unit: '' },
    { label: 'Altitude', value: `${Math.round(data.alt)}`, unit: 'm' },
    { label: 'Speed', value: `${data.speed_ms.toFixed(1)}`, unit: 'm/s' },
    { label: 'Battery', value: `${data.battery_v.toFixed(1)}`, unit: 'V' },
    { label: 'ESC Temp', value: `${Math.round(data.esc_temp_c)}`, unit: '°C' },
    { label: 'Wind Speed', value: `${data.wind_ms.toFixed(1)}`, unit: 'm/s' },
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      {telemetryItems.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {item.label}
          </span>
          <span className="text-sm font-mono text-primary">
            {item.value}{item.unit}
          </span>
        </div>
      ))}
      
      <div className="pt-2 border-t text-xs text-muted-foreground">
        Last update: {new Date(data.ts).toLocaleTimeString()}
      </div>
    </div>
  );
};