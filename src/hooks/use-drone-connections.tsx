import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DroneConnection {
  id: string;
  name: string;
  ip: string;
  port: number;
  protocol: 'udp' | 'tcp';
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastSeen?: string;
  telemetry?: any;
  socket?: WebSocket;
  jetsonInfo?: {
    model: string;
    serial: string;
    version: string;
  };
}

export function useDroneConnections() {
  const [connections, setConnections] = useState<DroneConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<string | null>(null);

  // Load saved connections
  useEffect(() => {
    const loadConnections = async () => {
      const saved = localStorage.getItem('drone_connections');
      if (saved) {
        const parsedConnections = JSON.parse(saved);
        setConnections(parsedConnections);
        
        // Try to restore connections
        parsedConnections?.forEach((conn: DroneConnection) => {
          if (conn.status === 'connected') {
            connectToDrone(conn.id);
          }
        });
      }
    };

    loadConnections();
  }, []);

  // Save connections to localStorage
  const saveConnections = useCallback((newConnections: DroneConnection[]) => {
    localStorage.setItem('drone_connections', JSON.stringify(newConnections));
  }, []);

  const addDroneConnection = useCallback((drone: Omit<DroneConnection, 'status'>) => {
    const newConnection: DroneConnection = {
      ...drone,
      status: 'disconnected'
    };

    setConnections(prev => {
      const updated = [...prev, newConnection];
      saveConnections(updated);
      return updated;
    });

    return newConnection.id;
  }, [saveConnections]);

  const removeDroneConnection = useCallback((droneId: string) => {
    setConnections(prev => {
      const connection = prev.find(c => c.id === droneId);
      if (connection?.socket) {
        connection.socket.close();
      }
      
      const updated = prev.filter(c => c.id !== droneId);
      saveConnections(updated);
      return updated;
    });

    if (activeConnection === droneId) {
      setActiveConnection(null);
    }
  }, [activeConnection, saveConnections]);

  const updateConnectionStatus = useCallback((droneId: string, status: DroneConnection['status'], telemetry?: any) => {
    setConnections(prev => prev.map(conn => 
      conn.id === droneId 
        ? { 
            ...conn, 
            status, 
            lastSeen: status === 'connected' ? new Date().toISOString() : conn.lastSeen,
            telemetry: telemetry || conn.telemetry
          }
        : conn
    ));
  }, []);

  const connectToDrone = useCallback(async (droneId: string) => {
    const connection = connections.find(c => c.id === droneId);
    if (!connection) return false;

    updateConnectionStatus(droneId, 'connecting');

    try {
      // Create WebSocket connection to Jetson GCS backend
      const wsUrl = `ws://${connection.ip}:5000/socket.io/?EIO=4&transport=websocket`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log(`🚁 Connected to drone ${connection.name} at ${connection.ip}`);
        updateConnectionStatus(droneId, 'connected');
        
        // Set as active connection
        setActiveConnection(droneId);

        // Request initial telemetry
        socket.send(JSON.stringify({
          type: 'request_telemetry'
        }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'telemetry_update') {
            updateConnectionStatus(droneId, 'connected', data.telemetry);
            
            // Store in Supabase for historical tracking
            supabase.from('drone_telemetry').insert({
              drone_id: droneId,
              timestamp: new Date().toISOString(),
              battery_level: data.telemetry.battery_voltage,
              location_latitude: data.telemetry.gps_lat,
              location_longitude: data.telemetry.gps_lon,
              altitude_meters: data.telemetry.altitude,
              speed_ms: data.telemetry.groundspeed,
              raw_data: data.telemetry
            });
          }
        } catch (error) {
          console.error('Error parsing telemetry:', error);
        }
      };

      socket.onclose = () => {
        console.log(`🚁 Disconnected from drone ${connection.name}`);
        updateConnectionStatus(droneId, 'disconnected');
        
        if (activeConnection === droneId) {
          setActiveConnection(null);
        }
      };

      socket.onerror = (error) => {
        console.error(`🚁 Connection error for drone ${connection.name}:`, error);
        updateConnectionStatus(droneId, 'error');
      };

      // Store socket reference
      setConnections(prev => prev.map(conn => 
        conn.id === droneId ? { ...conn, socket } : conn
      ));

      return true;

    } catch (error) {
      console.error(`Failed to connect to drone ${connection.name}:`, error);
      updateConnectionStatus(droneId, 'error');
      return false;
    }
  }, [connections, updateConnectionStatus, activeConnection]);

  const disconnectFromDrone = useCallback((droneId: string) => {
    const connection = connections.find(c => c.id === droneId);
    if (connection?.socket) {
      connection.socket.close();
    }
    
    updateConnectionStatus(droneId, 'disconnected');
    
    if (activeConnection === droneId) {
      setActiveConnection(null);
    }
  }, [connections, updateConnectionStatus, activeConnection]);

  const sendCommand = useCallback(async (droneId: string, command: string, params?: any) => {
    const connection = connections.find(c => c.id === droneId);
    if (!connection?.socket || connection.status !== 'connected') {
      return false;
    }

    try {
      connection.socket.send(JSON.stringify({
        type: 'send_command',
        command,
        params
      }));
      return true;
    } catch (error) {
      console.error(`Failed to send command to drone ${connection.name}:`, error);
      return false;
    }
  }, [connections]);

  const discoverDrones = useCallback(async (ipRange: string = '192.168.1') => {
    // Network discovery for Jetson devices
    const discoveredDrones: Omit<DroneConnection, 'status'>[] = [];
    
    // Scan common Jetson IP addresses
    for (let i = 100; i <= 200; i++) {
      const ip = `${ipRange}.${i}`;
      
      try {
        // Check if Jetson GCS is running on this IP
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);
        
        const response = await fetch(`http://${ip}:5000/api/health`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const health = await response.json();
          
          discoveredDrones.push({
            id: `drone_${ip.replace(/\./g, '_')}`,
            name: `Drone @ ${ip}`,
            ip,
            port: 5000,
            protocol: 'tcp',
            jetsonInfo: {
              model: health.platform || 'Jetson Nano',
              serial: ip,
              version: health.version || '1.0.0'
            }
          });
        }
      } catch (error) {
        // IP not reachable or no GCS running
      }
    }

    return discoveredDrones;
  }, []);

  return {
    connections,
    activeConnection,
    setActiveConnection,
    addDroneConnection,
    removeDroneConnection,
    connectToDrone,
    disconnectFromDrone,
    sendCommand,
    discoverDrones,
    updateConnectionStatus
  };
}