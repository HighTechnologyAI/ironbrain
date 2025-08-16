// Mission service for CRUD operations and Jetson integration
// Consolidates mission-related functionality

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Mission = Database['public']['Tables']['missions']['Row'];
type MissionInsert = Database['public']['Tables']['missions']['Insert'];
type MissionUpdate = Database['public']['Tables']['missions']['Update'];

export class MissionService {
  // Create mission
  static async createMission(mission: MissionInsert) {
    const { data, error } = await supabase
      .from('missions')
      .insert(mission)
      .select()
      .single();

    return { data, error };
  }

  // Get all missions
  static async getMissions() {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  }

  // Get mission by ID
  static async getMissionById(id: string) {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  }

  // Update mission
  static async updateMission(id: string, updates: MissionUpdate) {
    const { data, error } = await supabase
      .from('missions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  }

  // Delete mission
  static async deleteMission(id: string) {
    const { data, error } = await supabase
      .from('missions')
      .delete()
      .eq('id', id);

    return { data, error };
  }

  // Subscribe to mission changes
  static subscribeMissions(callback: (payload: any) => void) {
    const channel = supabase
      .channel('missions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'missions'
        },
        callback
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  // Send command to Jetson drone
  static async sendDroneCommand(droneId: string, command: string, params?: any) {
    try {
      // This would integrate with Jetson GCS backend
      const response = await fetch(`/api/mavlink/command`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          params: { droneId, ...params }
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Failed to send drone command:', error);
      return { success: false, error: error.message };
    }
  }
}