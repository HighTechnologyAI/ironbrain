import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface JetsonConnection {
  id: string;
  name: string;
  ip: string;
  port: number;
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastSeen?: string;
  telemetry?: {
    battery_level?: number;
    location_latitude?: number;
    location_longitude?: number;
    altitude_meters?: number;
    speed_ms?: number;
    heading_degrees?: number;
    armed?: boolean;
    flight_mode?: string;
    battery_voltage?: number;
    temperature_celsius?: number;
  };
  jetsonStatus?: {
    service: string;
    version: string;
    platform: string;
    uptime: number;
    memory_usage: number;
    cpu_usage: number;
  };
  mavlinkConnected?: boolean;
  lastUpdate?: string;
}

export function useJetsonConnections() {
  const [connections, setConnections] = useState<JetsonConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Load saved connections
  useEffect(() => {
    const loadConnections = async () => {
      const saved = localStorage.getItem('jetson_connections');
      if (saved) {
        try {
          const parsedConnections = JSON.parse(saved);
          setConnections(parsedConnections);
          
          // Auto-reconnect to previously connected drones
          parsedConnections?.forEach((conn: JetsonConnection) => {
            if (conn.status === 'connected') {
              connectToJetson(conn.id);
            }
          });
        } catch (error) {
          console.error('Error loading Jetson connections:', error);
        }
      }
    };

    loadConnections();
  }, []);

  // Save connections to localStorage
  const saveConnections = useCallback((newConnections: JetsonConnection[]) => {
    localStorage.setItem('jetson_connections', JSON.stringify(newConnections));
  }, []);

  // Add new Jetson connection
  const addJetsonConnection = useCallback((jetson: Omit<JetsonConnection, 'status'>) => {
    const newConnection: JetsonConnection = {
      ...jetson,
      status: 'disconnected'
    };

    setConnections(prev => {
      const updated = [...prev, newConnection];
      saveConnections(updated);
      return updated;
    });

    return newConnection.id;
  }, [saveConnections]);

  // Remove Jetson connection
  const removeJetsonConnection = useCallback((jetsonId: string) => {
    setConnections(prev => {
      const connection = prev.find(c => c.id === jetsonId);
      if (connection?.status === 'connected') {
        disconnectFromJetson(jetsonId);
      }
      
      const updated = prev.filter(c => c.id !== jetsonId);
      saveConnections(updated);
      return updated;
    });

    if (activeConnection === jetsonId) {
      setActiveConnection(null);
    }
  }, [activeConnection, saveConnections]);

  // Update connection status
  const updateConnectionStatus = useCallback((jetsonId: string, status: JetsonConnection['status'], data?: any) => {
    setConnections(prev => {
      const updated = prev.map(conn => 
        conn.id === jetsonId 
          ? { 
              ...conn, 
              status, 
              lastSeen: new Date().toISOString(),
              ...(data && data)
            }
          : conn
      );
      saveConnections(updated);
      return updated;
    });
  }, [saveConnections]);

  // Call Jetson Bridge Edge Function
  const callJetsonBridge = useCallback(async (jetsonIp: string, jetsonPort: number, action: string, data?: any) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('jetson-bridge', {
        body: { 
          action, 
          jetson_ip: jetsonIp, 
          jetson_port: jetsonPort,
          ...(data && { data })
        }
      });

      if (error) {
        throw new Error(error.message || 'Function invocation failed');
      }

      return result;
    } catch (error) {
      console.error(`Jetson Bridge ${action} error:`, error);
      throw error;
    }
  }, []);

  // Connect to Jetson
  const connectToJetson = useCallback(async (jetsonId: string) => {
    const connection = connections.find(c => c.id === jetsonId);
    if (!connection) return false;

    updateConnectionStatus(jetsonId, 'connecting');

    try {
      // Health check first
      const healthResult = await callJetsonBridge(connection.ip, connection.port, 'health');
      
      if (!healthResult.success) {
        throw new Error(healthResult.error || 'Health check failed');
      }

      // Get initial telemetry
      const telemetryResult = await callJetsonBridge(connection.ip, connection.port, 'telemetry');
      
      updateConnectionStatus(jetsonId, 'connected', {
        jetsonStatus: healthResult.jetson_status,
        telemetry: telemetryResult.success ? telemetryResult.telemetry?.telemetry : undefined,
        mavlinkConnected: telemetryResult.success && telemetryResult.telemetry?.connection?.connected,
        lastUpdate: new Date().toISOString()
      });

      // Set as active connection
      setActiveConnection(jetsonId);
      
      // Start telemetry polling
      startTelemetryPolling(jetsonId);

      // Store telemetry in Supabase
      if (telemetryResult.success && telemetryResult.telemetry?.telemetry) {
        await storeTelemetryData(jetsonId, telemetryResult.telemetry.telemetry);
      }

      console.log(`✅ Connected to Jetson: ${connection.name} (${connection.ip}:${connection.port})`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to connect to Jetson ${connection.name}:`, error);
      updateConnectionStatus(jetsonId, 'error');
      return false;
    }
  }, [connections, updateConnectionStatus, callJetsonBridge]);

  // Disconnect from Jetson
  const disconnectFromJetson = useCallback(async (jetsonId: string) => {
    const connection = connections.find(c => c.id === jetsonId);
    if (!connection) return;

    try {
      // Stop polling
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }

      updateConnectionStatus(jetsonId, 'disconnected');

      if (activeConnection === jetsonId) {
        setActiveConnection(null);
      }

      console.log(`🔌 Disconnected from Jetson: ${connection.name}`);
    } catch (error) {
      console.error(`Error disconnecting from Jetson ${connection.name}:`, error);
    }
  }, [connections, activeConnection, pollingInterval, updateConnectionStatus]);

  // Start telemetry polling
  const startTelemetryPolling = useCallback((jetsonId: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      const connection = connections.find(c => c.id === jetsonId);
      if (!connection || connection.status !== 'connected') {
        clearInterval(interval);
        return;
      }

      try {
        const result = await callJetsonBridge(connection.ip, connection.port, 'telemetry');
        
        if (result.success && result.telemetry) {
          updateConnectionStatus(jetsonId, 'connected', {
            telemetry: result.telemetry.telemetry,
            mavlinkConnected: result.telemetry.connection?.connected,
            lastUpdate: new Date().toISOString()
          });

          // Store in Supabase
          if (result.telemetry.telemetry) {
            await storeTelemetryData(jetsonId, result.telemetry.telemetry);
          }
        }
      } catch (error) {
        console.error('Telemetry polling error:', error);
        updateConnectionStatus(jetsonId, 'error');
      }
    }, 2000); // 2 second intervals

    setPollingInterval(interval);
  }, [connections, pollingInterval, callJetsonBridge, updateConnectionStatus]);

  // Store telemetry data in Supabase
  const storeTelemetryData = useCallback(async (jetsonId: string, telemetry: any) => {
    try {
      const { error } = await supabase
        .from('drone_telemetry')
        .insert({
          drone_id: jetsonId,
          battery_level: telemetry.battery_level || 0,
          location_latitude: telemetry.location_latitude,
          location_longitude: telemetry.location_longitude,
          altitude_meters: telemetry.altitude_meters || 0,
          speed_ms: telemetry.speed_ms || 0,
          heading_degrees: telemetry.heading_degrees,
          battery_voltage: telemetry.battery_voltage,
          temperature_celsius: telemetry.temperature_celsius,
          flight_mode: telemetry.flight_mode,
          armed: telemetry.armed || false,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Error storing telemetry:', error);
      }
    } catch (error) {
      console.error('Telemetry storage error:', error);
    }
  }, []);

  // Send command to Jetson
  const sendCommand = useCallback(async (jetsonId: string, command: string, params?: any) => {
    const connection = connections.find(c => c.id === jetsonId);
    if (!connection || connection.status !== 'connected') {
      throw new Error('Jetson not connected');
    }

    try {
      const result = await callJetsonBridge(connection.ip, connection.port, 'command', {
        command,
        params
      });

      if (!result.success) {
        throw new Error(result.error || 'Command failed');
      }

      console.log(`📡 Command sent to ${connection.name}:`, command, params);
      return result.result;
    } catch (error) {
      console.error(`❌ Command failed for ${connection.name}:`, error);
      throw error;
    }
  }, [connections, callJetsonBridge]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return {
    // Data
    connections,
    activeConnection,
    
    // Actions
    addJetsonConnection,
    removeJetsonConnection,
    connectToJetson,
    disconnectFromJetson,
    sendCommand,
    updateConnectionStatus,
    
    // Helpers
    getActiveConnection: () => connections.find(c => c.id === activeConnection),
    getAllConnected: () => connections.filter(c => c.status === 'connected')
  };
}