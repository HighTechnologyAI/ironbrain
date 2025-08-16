// Drone service for telemetry and control
// Consolidates drone-related functionality

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Drone = Database['public']['Tables']['drones']['Row'];
type DroneTelemetry = Database['public']['Tables']['drone_telemetry']['Row'];

export class DroneService {
  // Get all drones
  static async getDrones() {
    const { data, error } = await supabase
      .from('drones')
      .select('*')
      .order('name');

    return { data, error };
  }

  // Get drone telemetry
  static async getDroneTelemetry(droneId?: string, limit = 100) {
    let query = supabase
      .from('drone_telemetry')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (droneId) {
      query = query.eq('drone_id', droneId);
    }

    const { data, error } = await query;
    return { data, error };
  }

  // Create drone
  static async createDrone(drone: Database['public']['Tables']['drones']['Insert']) {
    const { data, error } = await supabase
      .from('drones')
      .insert(drone)
      .select()
      .single();

    return { data, error };
  }

  // Update drone
  static async updateDrone(id: string, updates: Database['public']['Tables']['drones']['Update']) {
    const { data, error } = await supabase
      .from('drones')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  // Subscribe to drone telemetry
  static subscribeTelemetry(callback: (payload: any) => void) {
    const channel = supabase
      .channel('drone-telemetry')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'drone_telemetry'
        },
        callback
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  // Subscribe to drone status changes
  static subscribeDroneChanges(callback: (payload: any) => void) {
    const channel = supabase
      .channel('drone-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drones'
        },
        callback
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  // Get drone statistics
  static async getDroneStats() {
    const { data, error } = await supabase
      .from('drone_status_view')
      .select('*');

    if (error) return { data: null, error };

    // Calculate aggregated stats
    const stats = {
      total: data.length,
      online: data.filter(d => d.status === 'online').length,
      offline: data.filter(d => d.status === 'offline').length,
      mission: data.filter(d => d.status === 'mission').length,
      avgBattery: data.reduce((sum, d) => sum + (d.battery_level || 0), 0) / data.length,
    };

    return { data: stats, error: null };
  }
}