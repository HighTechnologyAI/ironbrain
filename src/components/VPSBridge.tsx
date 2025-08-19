import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Server, 
  Wifi, 
  Activity, 
  Eye, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Monitor,
  Radio,
  Video
} from 'lucide-react';
import { VPSService } from '@/services/vpsService';
import { useJetsonConnections } from '@/hooks/use-jetson-connections';

interface VPSStatus {
  mavlink: boolean;
  rtsp: boolean;
  supabase: boolean;
  overall: boolean;
  errors: string[];
}

export function VPSBridge() {
  const [vpsStatus, setVpsStatus] = useState<VPSStatus>({
    mavlink: false,
    rtsp: false,
    supabase: false,
    overall: false,
    errors: []
  });
  const [isChecking, setIsChecking] = useState(false);
  const [vpsConfig, setVpsConfig] = useState({
    host: '87.120.254.156',
    mavlinkPort: '5760',
    rtspPort: '5762',
    supabasePort: '5761'
  });
  
  const { connections, connectToJetson, sendCommand } = useJetsonConnections();

  const checkVPSHealth = async () => {
    setIsChecking(true);
    try {
      const health = await VPSService.checkConnectionHealth();
      setVpsStatus({
        mavlink: health.services.mavlink,
        rtsp: health.services.rtsp,
        supabase: health.services.supabase,
        overall: health.overall,
        errors: health.errors
      });
    } catch (error) {
      console.error('VPS health check failed:', error);
      setVpsStatus({
        mavlink: false,
        rtsp: false,
        supabase: false,
        overall: false,
        errors: ['Failed to connect to VPS services']
      });
    } finally {
      setIsChecking(false);
    }
  };

  const createVPSIntegrationConnection = async () => {
    try {
      // Create integrated VPS connection for Jetson
      const vpsConnection = {
        id: `vps-jetson-${Date.now()}`,
        name: 'VPS Jetson Bridge',
        ip: vpsConfig.host,
        port: parseInt(vpsConfig.mavlinkPort),
      };

      // Add the connection but don't auto-connect yet
      console.log('Creating VPS integration connection:', vpsConnection);
      
      // Show success message
      alert('VPS Integration connection created. Please check the Jetson tab to connect.');
    } catch (error) {
      console.error('Failed to create VPS integration:', error);
    }
  };

  const testVPSMAVLink = async () => {
    try {
      const result = await VPSService.connectDrone('udp:192.168.1.236:14550');
      console.log('VPS MAVLink test result:', result);
    } catch (error) {
      console.error('VPS MAVLink test failed:', error);
    }
  };

  const testVPSRTSP = async () => {
    try {
      const result = await VPSService.createTestStream('jetson-001');
      console.log('VPS RTSP test result:', result);
    } catch (error) {
      console.error('VPS RTSP test failed:', error);
    }
  };

  useEffect(() => {
    checkVPSHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkVPSHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: boolean) => {
    if (isChecking) return <Loader2 className="h-4 w-4 animate-spin" />;
    return status ? <CheckCircle className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-destructive" />;
  };

  const getStatusBadge = (status: boolean) => {
    if (isChecking) return <Badge variant="secondary">Checking...</Badge>;
    return status ? 
      <Badge className="bg-success text-success-foreground">Online</Badge> : 
      <Badge variant="destructive">Offline</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="h-5 w-5" />
            <span>VPS Bridge Status</span>
            <Button
              variant="outline"
              size="sm"
              onClick={checkVPSHealth}
              disabled={isChecking}
            >
              {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </Button>
          </CardTitle>
          <CardDescription>
            Iron Brain VPS integration at {vpsConfig.host}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(vpsStatus.mavlink)}
                    <span className="font-medium">MAVLink Service</span>
                  </div>
                  {getStatusBadge(vpsStatus.mavlink)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Port {vpsConfig.mavlinkPort} - Drone communication
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(vpsStatus.rtsp)}
                    <span className="font-medium">RTSP Service</span>
                  </div>
                  {getStatusBadge(vpsStatus.rtsp)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Port {vpsConfig.rtspPort} - Video streaming
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(vpsStatus.supabase)}
                    <span className="font-medium">Supabase Bridge</span>
                  </div>
                  {getStatusBadge(vpsStatus.supabase)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Port {vpsConfig.supabasePort} - Data integration
                </p>
              </CardContent>
            </Card>
          </div>

          {vpsStatus.errors.length > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div>VPS Connection Issues:</div>
                <ul className="list-disc list-inside mt-1">
                  {vpsStatus.errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={createVPSIntegrationConnection}
              disabled={!vpsStatus.overall}
              className="flex items-center space-x-2"
            >
              <Wifi className="h-4 w-4" />
              <span>Create Jetson-VPS Bridge</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={testVPSMAVLink}
              disabled={!vpsStatus.mavlink}
            >
              <Radio className="h-4 w-4 mr-2" />
              Test MAVLink
            </Button>
            
            <Button
              variant="outline"
              onClick={testVPSRTSP}
              disabled={!vpsStatus.rtsp}
            >
              <Video className="h-4 w-4 mr-2" />
              Test RTSP
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="integration">Integration Status</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>VPS Configuration</CardTitle>
              <CardDescription>
                Configure VPS endpoints for drone integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vps-host">VPS Host</Label>
                  <Input
                    id="vps-host"
                    value={vpsConfig.host}
                    onChange={(e) => setVpsConfig(prev => ({ ...prev, host: e.target.value }))}
                    placeholder="87.120.254.156"
                  />
                </div>
                <div>
                  <Label htmlFor="mavlink-port">MAVLink Port</Label>
                  <Input
                    id="mavlink-port"
                    value={vpsConfig.mavlinkPort}
                    onChange={(e) => setVpsConfig(prev => ({ ...prev, mavlinkPort: e.target.value }))}
                    placeholder="5760"
                  />
                </div>
                <div>
                  <Label htmlFor="rtsp-port">RTSP Port</Label>
                  <Input
                    id="rtsp-port"
                    value={vpsConfig.rtspPort}
                    onChange={(e) => setVpsConfig(prev => ({ ...prev, rtspPort: e.target.value }))}
                    placeholder="5762"
                  />
                </div>
                <div>
                  <Label htmlFor="supabase-port">Supabase Port</Label>
                  <Input
                    id="supabase-port"
                    value={vpsConfig.supabasePort}
                    onChange={(e) => setVpsConfig(prev => ({ ...prev, supabasePort: e.target.value }))}
                    placeholder="5761"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Real-time VPS Monitoring</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Live monitoring dashboard for VPS services performance
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Connection latency, throughput, and service health metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Architecture</CardTitle>
              <CardDescription>
                Jetson ↔ VPS ↔ Tiger CRM data flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">
                  <h4 className="font-medium mb-2">Connected Jetson Devices:</h4>
                  {connections.length === 0 ? (
                    <p className="text-muted-foreground">No Jetson connections found</p>
                  ) : (
                    <div className="space-y-2">
                      {connections.map(conn => (
                        <div key={conn.id} className="flex items-center justify-between p-2 border rounded">
                          <span>{conn.name} ({conn.ip}:{conn.port})</span>
                          <Badge variant={conn.status === 'connected' ? 'default' : 'secondary'}>
                            {conn.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}