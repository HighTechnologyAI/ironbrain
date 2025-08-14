import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Mission {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'armed' | 'in_flight' | 'completed' | 'aborted';
  drone_id?: string;
  waypoints: number;
  altitude_meters?: number;
  start_time?: string;
  end_time?: string;
  progress: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Joined drone data
  drone?: {
    id: string;
    name: string;
    model?: string;
    status?: string;
    battery_level?: number;
  };
}

export const useMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('missions')
          .select(`
            *,
            drone:uav_drones(id, name, model, status, battery_level)
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setMissions((data || []) as Mission[]);
      } catch (err) {
        console.error('Error fetching missions:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
    
    // Real-time subscription
    const channel = supabase
      .channel('missions-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'missions' }, 
          () => fetchMissions()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createMission = async (missionData: Omit<Mission, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('missions')
        .insert([missionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating mission:', err);
      throw err;
    }
  };

  const updateMission = async (id: string, updates: Partial<Mission>) => {
    try {
      const { data, error } = await supabase
        .from('missions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating mission:', err);
      throw err;
    }
  };

  return { missions, loading, error, createMission, updateMission };
};