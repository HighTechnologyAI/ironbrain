import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Drone {
  id: string;
  name: string;
  model?: string;
  serial?: string;
  status?: string;
  battery_level?: number;
  firmware?: string;
  location_lat?: number;
  location_lon?: number;
  last_contact?: string;
  created_by?: string;
  created_at: string;
}

export const useDrones = () => {
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrones = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('drone_status_view')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const normalized = (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          model: row.model,
          serial: row.serial_number,
          status: row.status,
          battery_level: row.battery_level != null ? Number(row.battery_level) : undefined,
          firmware: undefined,
          location_lat: row.location_latitude != null ? Number(row.location_latitude) : undefined,
          location_lon: row.location_longitude != null ? Number(row.location_longitude) : undefined,
          last_contact: row.last_telemetry || null,
          created_by: undefined,
          created_at: row.created_at,
        }));
        
        setDrones(normalized);
      } catch (err) {
        console.error('Error fetching drones:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDrones();
    
    // Real-time subscription with throttling
    const channel = supabase
      .channel('drones-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'drones' }, () => {
        // Throttle updates to prevent excessive refreshes
        setTimeout(fetchDrones, 1000);
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createDrone = async (droneData: Omit<Drone, 'id' | 'created_at'>) => {
    try {
      const payload: any = {
        name: droneData.name,
        model: droneData.model,
        serial_number: droneData.serial,
        status: droneData.status ?? 'offline',
        battery_level: droneData.battery_level ?? 0,
        location_latitude: droneData.location_lat,
        location_longitude: droneData.location_lon,
        created_by: droneData.created_by,
      };

      const { data, error } = await supabase
        .from('drones')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating drone:', err);
      throw err;
    }
  };

  const updateDrone = async (id: string, updates: Partial<Drone>) => {
    try {
      const updatesPayload: any = {
        name: updates.name,
        model: updates.model,
        serial_number: updates.serial,
        status: updates.status,
        battery_level: updates.battery_level,
        location_latitude: updates.location_lat,
        location_longitude: updates.location_lon,
      };

      const { data, error } = await supabase
        .from('drones')
        .update(updatesPayload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating drone:', err);
      throw err;
    }
  };

  return { drones, loading, error, createDrone, updateDrone };
};