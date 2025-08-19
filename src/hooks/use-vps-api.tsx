import { useState, useCallback } from 'react';

export interface VPSDroneInfo {
  device_id: string;
  status: 'online' | 'offline' | 'mission' | 'error';
  last_seen: string;
  battery_level?: number;
  location?: { 
    latitude: number; 
    longitude: number; 
    altitude?: number; 
  };
  flight_mode?: string;
  armed?: boolean;
  telemetry?: any;
}

export interface VPSApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

class VPSApiClient {
  private baseURL: string;
  private wsURL: string;
  private ws: WebSocket | null = null;

  constructor() {
    // VPS на самом деле работает на порту 5761, не 3001
    this.baseURL = "http://87.120.254.156:5761/api/v1";
    this.wsURL = "ws://87.120.254.156:5761";
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<VPSApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // VPS Health & Status
  async getVPSHealth(): Promise<VPSApiResponse> {
    return this.request('/health');
  }

  async getVPSStatus(): Promise<VPSApiResponse> {
    return this.request('/status');
  }

  // Drone Management
  async getDrones(): Promise<VPSApiResponse<{ drones: VPSDroneInfo[] }>> {
    return this.request('/drones');
  }

  async getDroneStatus(deviceId: string): Promise<VPSApiResponse<VPSDroneInfo>> {
    return this.request(`/drone/${deviceId}/status`);
  }

  async getDroneTelemetry(deviceId: string): Promise<VPSApiResponse> {
    return this.request(`/drone/${deviceId}/telemetry`);
  }

  // Drone Commands
  async sendDroneCommand(deviceId: string, command: string, params?: any): Promise<VPSApiResponse> {
    return this.request(`/drone/${deviceId}/${command}`, {
      method: 'POST',
      body: JSON.stringify(params || {}),
    });
  }

  // Specific Commands
  async takeoff(deviceId: string, altitude?: number): Promise<VPSApiResponse> {
    return this.sendDroneCommand(deviceId, 'takeoff', { altitude: altitude || 10 });
  }

  async land(deviceId: string): Promise<VPSApiResponse> {
    return this.sendDroneCommand(deviceId, 'land');
  }

  async arm(deviceId: string): Promise<VPSApiResponse> {
    return this.sendDroneCommand(deviceId, 'arm');
  }

  async disarm(deviceId: string): Promise<VPSApiResponse> {
    return this.sendDroneCommand(deviceId, 'disarm');
  }

  async setFlightMode(deviceId: string, mode: string): Promise<VPSApiResponse> {
    return this.sendDroneCommand(deviceId, 'mode', { flight_mode: mode });
  }

  async goto(deviceId: string, latitude: number, longitude: number, altitude?: number): Promise<VPSApiResponse> {
    return this.sendDroneCommand(deviceId, 'goto', {
      latitude,
      longitude,
      altitude: altitude || 10
    });
  }

  // Mission Management
  async uploadMission(deviceId: string, waypoints: any[]): Promise<VPSApiResponse> {
    return this.request(`/drone/${deviceId}/mission`, {
      method: 'POST',
      body: JSON.stringify({ waypoints }),
    });
  }

  async startMission(deviceId: string): Promise<VPSApiResponse> {
    return this.sendDroneCommand(deviceId, 'mission/start');
  }

  async pauseMission(deviceId: string): Promise<VPSApiResponse> {
    return this.sendDroneCommand(deviceId, 'mission/pause');
  }

  async resumeMission(deviceId: string): Promise<VPSApiResponse> {
    return this.sendDroneCommand(deviceId, 'mission/resume');
  }

  async stopMission(deviceId: string): Promise<VPSApiResponse> {
    return this.sendDroneCommand(deviceId, 'mission/stop');
  }

  // Real-time WebSocket Connection
  connectWebSocket(onMessage?: (data: any) => void, onError?: (error: Event) => void): void {
    try {
      this.ws = new WebSocket(this.wsURL);
      
      this.ws.onopen = () => {
        console.log('✅ VPS WebSocket connected');
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ VPS WebSocket error:', error);
        onError?.(error);
      };
      
      this.ws.onclose = () => {
        console.log('🔌 VPS WebSocket disconnected');
        // Auto-reconnect after 5 seconds
        setTimeout(() => this.connectWebSocket(onMessage, onError), 5000);
      };
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      onError?.(error as Event);
    }
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  sendWebSocketMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  }
}

// React Hook for VPS API
export function useVPSApi() {
  const [client] = useState(() => new VPSApiClient());
  const [isConnected, setIsConnected] = useState(false);
  const [drones, setDrones] = useState<VPSDroneInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDrones = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await client.getDrones();
      if (response.success && response.data?.drones) {
        setDrones(response.data.drones);
      }
    } catch (error) {
      console.error('Error fetching drones:', error);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const connectRealTime = useCallback(() => {
    client.connectWebSocket(
      (data) => {
        // Handle real-time updates
        if (data.type === 'telemetry_update' && data.device_id) {
          setDrones(prev => prev.map(drone => 
            drone.device_id === data.device_id 
              ? { ...drone, ...data.telemetry, last_seen: new Date().toISOString() }
              : drone
          ));
        }
        setIsConnected(true);
      },
      () => {
        setIsConnected(false);
      }
    );
  }, [client]);

  const disconnect = useCallback(() => {
    client.disconnectWebSocket();
    setIsConnected(false);
  }, [client]);

  return {
    client,
    drones,
    isConnected,
    isLoading,
    fetchDrones,
    connectRealTime,
    disconnect,
    
    // Direct command helpers
    takeoff: (deviceId: string, altitude?: number) => client.takeoff(deviceId, altitude),
    land: (deviceId: string) => client.land(deviceId),
    arm: (deviceId: string) => client.arm(deviceId),
    disarm: (deviceId: string) => client.disarm(deviceId),
    goto: (deviceId: string, lat: number, lng: number, alt?: number) => client.goto(deviceId, lat, lng, alt),
    setFlightMode: (deviceId: string, mode: string) => client.setFlightMode(deviceId, mode),
  };
}