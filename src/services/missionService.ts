import { supabase } from '@/integrations/supabase/client';

export interface Mission {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'failed';
  drone_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  start_time?: string;
  end_time?: string;
  progress?: number;
}

export interface MissionWaypoint {
  id: string;
  mission_id: string;
  sequence_number: number;
  lat: number;
  lon: number;
  alt_meters: number;
  action: 'takeoff' | 'waypoint' | 'hover' | 'land';
  hold_time_seconds: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ExtendedMission {
  id: string;
  name: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'failed';
  org_id: string;
  created_by?: string;
  starts_at?: string;
  ends_at?: string;
  geo_fence?: any;
  ruleset?: any;
  created_at: string;
  updated_at: string;
}

export class MissionService {
  // Legacy mission methods (keep for backward compatibility)
  static async getMissions() {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching missions:', error);
      return { data: null, error };
    }
  }

  static async createMission(mission: Partial<Mission>) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .insert(mission as any)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating mission:', error);
      return { data: null, error };
    }
  }

  static async updateMission(id: string, updates: Partial<Mission>) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating mission:', error);
      return { data: null, error };
    }
  }

  static async deleteMission(id: string) {
    try {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting mission:', error);
      return { error };
    }
  }

  static async getMissionById(id: string) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching mission:', error);
      return { data: null, error };
    }
  }

  // Extended missions (for Phase 4)
  static async getExtendedMissions() {
    try {
      const { data, error } = await supabase
        .from('missions_extended')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching extended missions:', error);
      return { data: null, error };
    }
  }

  static async createExtendedMission(mission: Partial<ExtendedMission>) {
    try {
      const { data, error } = await supabase
        .from('missions_extended')
        .insert(mission as any)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating extended mission:', error);
      return { data: null, error };
    }
  }

  static async updateExtendedMission(id: string, updates: Partial<ExtendedMission>) {
    try {
      const { data, error } = await supabase
        .from('missions_extended')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating extended mission:', error);
      return { data: null, error };
    }
  }

  // Mission Waypoints CRUD
  static async getMissionWaypoints(missionId: string) {
    try {
      const { data, error } = await supabase
        .from('mission_waypoints')
        .select('*')
        .eq('mission_id', missionId)
        .order('sequence_number', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching mission waypoints:', error);
      return { data: null, error };
    }
  }

  static async createWaypoint(waypoint: Partial<MissionWaypoint>) {
    try {
      const { data, error } = await supabase
        .from('mission_waypoints')
        .insert(waypoint as any)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating waypoint:', error);
      return { data: null, error };
    }
  }

  static async updateWaypoint(id: string, updates: Partial<MissionWaypoint>) {
    try {
      const { data, error } = await supabase
        .from('mission_waypoints')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating waypoint:', error);
      return { data: null, error };
    }
  }

  static async deleteWaypoint(id: string) {
    try {
      const { error } = await supabase
        .from('mission_waypoints')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting waypoint:', error);
      return { error };
    }
  }

  static async createWaypointsBatch(waypoints: Partial<MissionWaypoint>[]) {
    try {
      const { data, error } = await supabase
        .from('mission_waypoints')
        .insert(waypoints)
        .select();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating waypoints batch:', error);
      return { data: null, error };
    }
  }

  // Mission control operations
  static async startMission(missionId: string) {
    return this.updateExtendedMission(missionId, { 
      status: 'active',
      starts_at: new Date().toISOString()
    });
  }

  static async pauseMission(missionId: string) {
    return this.updateExtendedMission(missionId, { status: 'paused' });
  }

  static async completeMission(missionId: string) {
    return this.updateExtendedMission(missionId, { 
      status: 'completed',
      ends_at: new Date().toISOString()
    });
  }

  static async failMission(missionId: string) {
    return this.updateExtendedMission(missionId, { 
      status: 'failed',
      ends_at: new Date().toISOString()
    });
  }

  // Jetson integration (simulated for now)
  static async deployToJetson(missionId: string) {
    try {
      console.log(`Deploying mission ${missionId} to Jetson Nano...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, error: null };
    } catch (error) {
      console.error('Error deploying to Jetson:', error);
      return { success: false, error };
    }
  }

  static async getMissionStatus(missionId: string) {
    try {
      console.log(`Getting status for mission ${missionId}...`);
      
      const mockStatus = {
        missionId,
        status: 'active',
        progress: Math.floor(Math.random() * 100),
        currentWaypoint: Math.floor(Math.random() * 5) + 1,
        totalWaypoints: 8,
        dronePosition: {
          lat: 42.3601 + (Math.random() - 0.5) * 0.01,
          lng: 23.7911 + (Math.random() - 0.5) * 0.01,
          alt: 100 + Math.random() * 50
        },
        battery: 85 - Math.random() * 20,
        signal: 90 + Math.random() * 10
      };
      
      return { data: mockStatus, error: null };
    } catch (error) {
      console.error('Error getting mission status:', error);
      return { data: null, error };
    }
  }
}
