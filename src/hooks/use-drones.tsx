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
          .from('uav_drones')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setDrones(data || []);
      } catch (err) {
        console.error('Error fetching drones:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDrones();
    
    // Real-time subscription
    const channel = supabase
      .channel('drones-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'uav_drones' }, 
          () => fetchDrones()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createDrone = async (droneData: Omit<Drone, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('uav_drones')
        .insert([droneData])
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
      const { data, error } = await supabase
        .from('uav_drones')
        .update(updates)
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