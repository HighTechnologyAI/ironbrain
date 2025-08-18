// VPS Integration Service for Tiger CRM
// Handles communication with Iron Brain VPS services

import { APP_CONFIG } from '@/config/app-config';

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
  private static readonly baseUrl = APP_CONFIG.vps.baseUrl;

  // MAVLink Service API calls
  static async checkMAVLinkHealth(): Promise<VPSResponse> {
    try {
      const url = `${this.baseUrl}:${APP_CONFIG.vps.mavlink.port}${APP_CONFIG.vps.mavlink.endpoints.health}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('MAVLink health check failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async connectDrone(connectionString: string): Promise<VPSResponse> {
    try {
      const url = `${this.baseUrl}:${APP_CONFIG.vps.mavlink.port}${APP_CONFIG.vps.mavlink.endpoints.connect}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection_string: connectionString })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Drone connection failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async sendDroneCommand(command: string, params?: Record<string, any>): Promise<VPSResponse> {
    try {
      const url = `${this.baseUrl}:${APP_CONFIG.vps.mavlink.port}${APP_CONFIG.vps.mavlink.endpoints.command}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, ...params })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Drone command failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getDroneStatus(): Promise<VPSResponse<DroneStatus[]>> {
    try {
      const url = `${this.baseUrl}:${APP_CONFIG.vps.mavlink.port}${APP_CONFIG.vps.mavlink.endpoints.status}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Drone status fetch failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // RTSP Service API calls
  static async checkRTSPHealth(): Promise<VPSResponse> {
    try {
      const url = `${this.baseUrl}:${APP_CONFIG.vps.rtsp.port}${APP_CONFIG.vps.rtsp.endpoints.health}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('RTSP health check failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getActiveStreams(): Promise<VPSResponse<StreamInfo[]>> {
    try {
      const url = `${this.baseUrl}:${APP_CONFIG.vps.rtsp.port}${APP_CONFIG.vps.rtsp.endpoints.streams}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Streams fetch failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async createTestStream(droneId: string): Promise<VPSResponse> {
    try {
      const url = `${this.baseUrl}:${APP_CONFIG.vps.rtsp.port}${APP_CONFIG.vps.rtsp.endpoints.testStream}/${droneId}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Test stream creation failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Supabase Integration Service API calls
  static async checkSupabaseIntegrationHealth(): Promise<VPSResponse> {
    try {
      const url = `${this.baseUrl}:${APP_CONFIG.vps.supabaseIntegration.port}${APP_CONFIG.vps.supabaseIntegration.endpoints.health}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Supabase integration health check failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getVPSDrones(): Promise<VPSResponse> {
    try {
      const url = `${this.baseUrl}:${APP_CONFIG.vps.supabaseIntegration.port}${APP_CONFIG.vps.supabaseIntegration.endpoints.drones}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('VPS drones fetch failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async sendTelemetryToSupabase(droneId: string, telemetry: Record<string, any>): Promise<VPSResponse> {
    try {
      const url = `${this.baseUrl}:${APP_CONFIG.vps.supabaseIntegration.port}${APP_CONFIG.vps.supabaseIntegration.endpoints.telemetry}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ drone_id: droneId, telemetry })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
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
  static getRTSPStreamUrl(droneId: string, streamName: string = 'main'): string {
    return `rtsp://${APP_CONFIG.vps.baseUrl.replace('http://', '')}:${APP_CONFIG.vps.rtsp.streamPort}/${droneId}/${streamName}`;
  }
}