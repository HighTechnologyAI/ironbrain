import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

export interface DroneStatus {
  id: string;
  name?: string;
  status: string;
  battery_level?: number;
  location_latitude?: number;
  location_longitude?: number;
  altitude_meters?: number;
  speed_ms?: number;
  last_heartbeat_at?: string;
  hw_rev?: string;
  fw_rev?: string;
  jetson_serial?: string;
}

export interface MissionInfo {
  id: string;
  name: string;
  status: string;
  created_by?: string;
  starts_at?: string;
  ends_at?: string;
  geo_fence?: any;
  assigned_drones?: string[];
}

export interface TelemetryData {
  id: string;
  drone_id: string;
  ts: string;
  lat?: number;
  lon?: number;
  alt?: number;
  vel?: number;
  hdg?: number;
  batt_v?: number;
  temp?: number;
  health?: any;
  payload_state?: any;
}

export function useDroneEcosystem() {
  const { user } = useAuth();
  const [drones, setDrones] = useState<DroneStatus[]>([]);
  const [missions, setMissions] = useState<MissionInfo[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch drones data
  const fetchDrones = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('drones_extended')
        .select('*')
        .order('name');

      if (error) throw error;
      setDrones(data || []);
    } catch (err) {
      console.error('Error fetching drones:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch drones');
    }
  }, []);

  // Fetch missions data
  const fetchMissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('missions_extended')
        .select(`
          *,
          mission_assignments(
            drone_id,
            drones_extended(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissions(data || []);
    } catch (err) {
      console.error('Error fetching missions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch missions');
    }
  }, []);

  // Fetch recent telemetry
  const fetchTelemetry = useCallback(async (droneId?: string, limit = 100) => {
    try {
      let query = supabase
        .from('telemetry')
        .select('*')
        .order('ts', { ascending: false })
        .limit(limit);

      if (droneId) {
        query = query.eq('drone_id', droneId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTelemetry(data || []);
    } catch (err) {
      console.error('Error fetching telemetry:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch telemetry');
    }
  }, []);

  // Create new mission
  const createMission = useCallback(async (missionData: Partial<MissionInfo> & { name: string }) => {
    try {
      const { data, error } = await supabase
        .from('missions_extended')
        .insert([{
          name: missionData.name,
          status: 'planning',
          ...missionData
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Refresh missions list
      await fetchMissions();
      
      return { data, error: null };
    } catch (err) {
      console.error('Error creating mission:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to create mission' 
      };
    }
  }, [fetchMissions]);

  // Update mission status
  const updateMissionStatus = useCallback(async (missionId: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('missions_extended')
        .update({ status })
        .eq('id', missionId)
        .select()
        .single();

      if (error) throw error;
      
      // Refresh missions list
      await fetchMissions();
      
      return { data, error: null };
    } catch (err) {
      console.error('Error updating mission status:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to update mission' 
      };
    }
  }, [fetchMissions]);

  // Assign drone to mission
  const assignDroneToMission = useCallback(async (missionId: string, droneId: string, role = 'primary') => {
    try {
      const { data, error } = await supabase
        .from('mission_assignments')
        .insert([{
          mission_id: missionId,
          drone_id: droneId,
          role
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Refresh missions list
      await fetchMissions();
      
      return { data, error: null };
    } catch (err) {
      console.error('Error assigning drone to mission:', err);
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to assign drone' 
      };
    }
  }, [fetchMissions]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to drone status changes
    const dronesChannel = supabase
      .channel('drones-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drones_extended'
        },
        () => {
          fetchDrones();
        }
      )
      .subscribe();

    // Subscribe to mission changes
    const missionsChannel = supabase
      .channel('missions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'missions_extended'
        },
        () => {
          fetchMissions();
        }
      )
      .subscribe();

    // Subscribe to telemetry updates
    const telemetryChannel = supabase
      .channel('telemetry-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telemetry'
        },
        (payload) => {
          setTelemetry(prev => [payload.new as TelemetryData, ...prev.slice(0, 99)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dronesChannel);
      supabase.removeChannel(missionsChannel);
      supabase.removeChannel(telemetryChannel);
    };
  }, [user, fetchDrones, fetchMissions]);

  // Initial data fetch
  useEffect(() => {
    if (!user) return;

    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchDrones(),
          fetchMissions(),
          fetchTelemetry()
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [user, fetchDrones, fetchMissions, fetchTelemetry]);

  return {
    // Data
    drones,
    missions,
    telemetry,
    loading,
    error,
    
    // Actions
    fetchDrones,
    fetchMissions,
    fetchTelemetry,
    createMission,
    updateMissionStatus,
    assignDroneToMission
  };
}