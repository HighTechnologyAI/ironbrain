import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DroneService } from '@/services/droneService';
import { VPSService } from '@/services/vpsService';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'error' | 'checking';
  message?: string;
  lastCheck?: string;
  responseTime?: number;
}

export function VPSConnectionMonitor() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'MAVLink', status: 'checking' },
    { name: 'RTSP', status: 'checking' },
    { name: 'Supabase Integration', status: 'checking' }
  ]);
  const [isChecking, setIsChecking] = useState(false);
  const [vpsData, setVpsData] = useState<any>(null);

  const checkServices = async () => {
    setIsChecking(true);
    const startTime = Date.now();

    try {
      const health = await DroneService.checkVPSHealth();
      const endTime = Date.now();

      const updatedServices = [
        {
          name: 'MAVLink',
          status: health.mavlink.success ? 'healthy' as const : 'error' as const,
          message: health.mavlink.error || 'Service available',
          lastCheck: new Date().toLocaleTimeString(),
          responseTime: endTime - startTime
        },
        {
          name: 'RTSP',
          status: health.rtsp.success ? 'healthy' as const : 'error' as const,
          message: health.rtsp.error || 'Service available',
          lastCheck: new Date().toLocaleTimeString(),
          responseTime: endTime - startTime
        },
        {
          name: 'Supabase Integration',
          status: health.supabaseIntegration.success ? 'healthy' as const : 'error' as const,
          message: health.supabaseIntegration.error || 'Service available',
          lastCheck: new Date().toLocaleTimeString(),
          responseTime: endTime - startTime
        }
      ];

      setServices(updatedServices);
    } catch (error) {
      console.error('Service check failed:', error);
      setServices(prev => prev.map(service => ({
        ...service,
        status: 'error' as const,
        message: 'Connection failed',
        lastCheck: new Date().toLocaleTimeString()
      })));
    } finally {
      setIsChecking(false);
    }
  };

  const fetchVPSData = async () => {
    try {
      const [droneStatus, streams] = await Promise.all([
        VPSService.getDroneStatus(),
        VPSService.getActiveStreams()
      ]);

      setVpsData({
        drones: droneStatus.data || [],
        streams: streams.data || [],
        lastUpdate: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('VPS data fetch failed:', error);
    }
  };

  useEffect(() => {
    checkServices();
    fetchVPSData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      checkServices();
      fetchVPSData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>VPS Services Status</CardTitle>
          <Button
            onClick={checkServices}
            disabled={isChecking}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {service.message}
                    </p>
                    {service.lastCheck && (
                      <p className="text-xs text-muted-foreground">
                        Last check: {service.lastCheck}
                        {service.responseTime && ` (${service.responseTime}ms)`}
                      </p>
                    )}
                  </div>
                </div>
                {getStatusBadge(service.status)}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {vpsData && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Connected Drones</CardTitle>
            </CardHeader>
            <CardContent>
              {vpsData.drones.length > 0 ? (
                <div className="space-y-2">
                  {vpsData.drones.map((drone: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{drone.drone_id || `Drone ${index + 1}`}</p>
                        <p className="text-sm text-muted-foreground">
                          Status: {drone.status || 'Unknown'}
                        </p>
                      </div>
                      <Badge 
                        variant={drone.status === 'online' ? 'default' : 'secondary'}
                      >
                        {drone.status || 'Unknown'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    No drones currently connected to VPS.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Streams</CardTitle>
            </CardHeader>
            <CardContent>
              {vpsData.streams.length > 0 ? (
                <div className="space-y-2">
                  {vpsData.streams.map((stream: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{stream.stream_name || `Stream ${index + 1}`}</p>
                        <p className="text-sm text-muted-foreground">
                          Drone: {stream.drone_id || 'Unknown'}
                        </p>
                      </div>
                      <Badge 
                        variant={stream.status === 'active' ? 'default' : 'secondary'}
                      >
                        {stream.status || 'Unknown'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertDescription>
                    No active video streams.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {vpsData && (
        <p className="text-sm text-muted-foreground text-center">
          Last updated: {vpsData.lastUpdate}
        </p>
      )}
    </div>
  );
}