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

// Enhanced real-time telemetry hook with presence tracking
export const useRealTimeTelemetry = (droneId?: string) => {
  const [latestData, setLatestData] = useState<TelemetryData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

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

  // Set up real-time subscription with enhanced error handling
  useEffect(() => {
    setConnectionStatus('connecting');
    
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
          setConnectionStatus('connected');
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnectionStatus('disconnected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setConnectionStatus('disconnected');
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
    isLoading,
    connectionStatus
  };
};

// UAV Events real-time hook
export const useRealTimeEvents = () => {
  const [latestEvent, setLatestEvent] = useState<any>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ['uav-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uav_events')
        .select('*')
        .order('ts', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  useEffect(() => {
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'uav_events'
        },
        (payload) => {
          console.log('New event:', payload.new);
          setLatestEvent(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    latestEvent,
    events,
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