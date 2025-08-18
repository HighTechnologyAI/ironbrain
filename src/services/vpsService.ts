// VPS Integration Service for Tiger CRM
// Handles communication with Iron Brain VPS services via Supabase Edge Functions (CORS proxy)

import { supabase } from '@/integrations/supabase/client';

interface VPSResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

interface DroneStatus {
  drone_id: string;
  status: string;
  battery_level?: number;
  location?: {
    latitude: number;
    longitude: number;
    altitude: number;
  };
  telemetry?: Record<string, any>;
  last_update?: string;
}

interface StreamInfo {
  drone_id: string;
  stream_name: string;
  url: string;
  status: 'active' | 'inactive';
  viewers: number;
}

export class VPSService {
  // MAVLink Service API calls via Edge Function proxy
  static async checkMAVLinkHealth(): Promise<VPSResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('vps-mavlink-proxy', {
        body: { endpoint: '/health' }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('MAVLink health check failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async connectDrone(connectionString: string): Promise<VPSResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('vps-mavlink-proxy', {
        body: { 
          endpoint: '/connect',
          method: 'POST',
          payload: { connection_string: connectionString }
        }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Drone connection failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async sendDroneCommand(command: string, params?: Record<string, any>): Promise<VPSResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('vps-mavlink-proxy', {
        body: { 
          endpoint: '/command',
          method: 'POST',
          payload: { command, ...params }
        }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Drone command failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getDroneStatus(): Promise<VPSResponse<DroneStatus[]>> {
    try {
      const { data, error } = await supabase.functions.invoke('vps-mavlink-proxy', {
        body: { endpoint: '/status' }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Drone status fetch failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // RTSP Service API calls via Edge Function proxy
  static async checkRTSPHealth(): Promise<VPSResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('vps-rtsp-proxy', {
        body: { endpoint: '/health' }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('RTSP health check failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getActiveStreams(): Promise<VPSResponse<StreamInfo[]>> {
    try {
      const { data, error } = await supabase.functions.invoke('vps-rtsp-proxy', {
        body: { endpoint: '/streams' }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Streams fetch failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async createTestStream(droneId: string): Promise<VPSResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('vps-rtsp-proxy', {
        body: { 
          endpoint: `/test_stream/${droneId}`,
          method: 'POST'
        }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Test stream creation failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Supabase Integration Service API calls via Edge Function proxy
  static async checkSupabaseIntegrationHealth(): Promise<VPSResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('vps-supabase-proxy', {
        body: { endpoint: '/health' }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Supabase integration health check failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getVPSDrones(): Promise<VPSResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('vps-supabase-proxy', {
        body: { endpoint: '/drones' }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('VPS drones fetch failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async sendTelemetryToSupabase(droneId: string, telemetry: Record<string, any>): Promise<VPSResponse> {
    try {
      // Исправляем формат данных согласно ошибке 400 из тестирования
      const payload = {
        drone_id: droneId,
        // Убеждаемся что статус соответствует enum в Supabase
        status: telemetry.status === 'flying' ? 'mission' : telemetry.status,
        battery_level: telemetry.battery_level,
        location_latitude: telemetry.location_latitude,
        location_longitude: telemetry.location_longitude,
        altitude_meters: telemetry.altitude_meters,
        speed_ms: telemetry.speed_ms
      };
      
      const { data, error } = await supabase.functions.invoke('vps-supabase-proxy', {
        body: { 
          endpoint: '/telemetry',
          method: 'POST',
          payload
        }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Telemetry send failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Health check for all services
  static async checkAllServicesHealth(): Promise<{
    mavlink: VPSResponse;
    rtsp: VPSResponse;
    supabaseIntegration: VPSResponse;
  }> {
    const [mavlink, rtsp, supabaseIntegration] = await Promise.all([
      this.checkMAVLinkHealth(),
      this.checkRTSPHealth(),
      this.checkSupabaseIntegrationHealth()
    ]);

    return { mavlink, rtsp, supabaseIntegration };
  }

  // Generate RTSP stream URL
  static getRTSPStreamUrl(droneId: string, streamName: string = 'test'): string {
    return `rtsp://president.ironbrain.site:8554/${droneId}/${streamName}`;
  }
  
  // Добавляем метод для обработки ошибок соединения
  static async checkConnectionHealth(): Promise<{
    overall: boolean;
    services: Record<string, boolean>;
    errors: string[];
  }> {
    const health = await this.checkAllServicesHealth();
    const errors: string[] = [];
    
    if (!health.mavlink.success) errors.push(`MAVLink: ${health.mavlink.error}`);
    if (!health.rtsp.success) errors.push(`RTSP: ${health.rtsp.error}`);
    if (!health.supabaseIntegration.success) errors.push(`Supabase: ${health.supabaseIntegration.error}`);
    
    return {
      overall: errors.length === 0,
      services: {
        mavlink: health.mavlink.success,
        rtsp: health.rtsp.success,
        supabase: health.supabaseIntegration.success
      },
      errors
    };
  }
}