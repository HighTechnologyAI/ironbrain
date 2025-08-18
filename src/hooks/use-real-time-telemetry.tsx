import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RealTimeTelemetry {
  droneId: string;
  timestamp: string;
  batteryLevel: number;
  altitude: number;
  speed: number;
  latitude?: number;
  longitude?: number;
  heading?: number;
  signalStrength?: number;
  gpsSatellites?: number;
  armed: boolean;
  flightMode: string;
  errors: any[];
}

export const useRealTimeTelemetry = (droneId?: string) => {
  const [telemetry, setTelemetry] = useState<RealTimeTelemetry | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!droneId) return;

    // Subscribe to real-time telemetry updates
    const channel = supabase
      .channel(`telemetry-${droneId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'drone_telemetry',
          filter: `drone_id=eq.${droneId}`
        },
        (payload) => {
          const newData = payload.new;
          setTelemetry({
            droneId: newData.drone_id,
            timestamp: newData.timestamp,
            batteryLevel: newData.battery_level,
            altitude: newData.altitude_meters,
            speed: newData.speed_ms,
            latitude: newData.location_latitude,
            longitude: newData.location_longitude,
            heading: newData.heading_degrees,
            signalStrength: newData.signal_strength,
            gpsSatellites: newData.gps_satellites,
            armed: newData.armed,
            flightMode: newData.flight_mode,
            errors: Array.isArray(newData.errors) ? newData.errors : []
          });
          setLastUpdate(new Date());
          setIsConnected(true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'drones',
          filter: `id=eq.${droneId}`
        },
        (payload) => {
          const newData = payload.new;
          // Update drone status changes
          if (telemetry) {
            setTelemetry(prev => prev ? {
              ...prev,
              batteryLevel: newData.battery_level || prev.batteryLevel,
              altitude: newData.altitude_meters || prev.altitude,
              speed: newData.speed_ms || prev.speed,
              latitude: newData.location_latitude || prev.latitude,
              longitude: newData.location_longitude || prev.longitude,
            } : null);
          }
          setLastUpdate(new Date());
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
        }
      });

    // Fetch initial telemetry data
    const fetchInitialData = async () => {
      const { data, error } = await supabase
        .from('drone_telemetry')
        .select('*')
        .eq('drone_id', droneId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setTelemetry({
          droneId: data.drone_id,
          timestamp: data.timestamp,
          batteryLevel: data.battery_level,
          altitude: data.altitude_meters,
          speed: data.speed_ms,
          latitude: data.location_latitude,
          longitude: data.location_longitude,
          heading: data.heading_degrees,
          signalStrength: data.signal_strength,
          gpsSatellites: data.gps_satellites,
          armed: data.armed,
          flightMode: data.flight_mode,
          errors: Array.isArray(data.errors) ? data.errors : []
        });
        setLastUpdate(new Date());
      }
    };

    fetchInitialData();

    // Connection health check
    const healthCheck = setInterval(() => {
      if (lastUpdate && Date.now() - lastUpdate.getTime() > 30000) {
        setIsConnected(false);
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(healthCheck);
    };
  }, [droneId, lastUpdate]);

  return {
    telemetry,
    isConnected,
    lastUpdate
  };
};