import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDroneConnections } from '@/hooks/use-drone-connections';
import GamepadController from '@/components/GamepadController';
import DroneConnectionManager from '@/components/DroneConnectionManager';
import GlobalMap from '@/components/GlobalMap';
import { 
  Radio, 
  Gamepad2, 
  Map, 
  Activity, 
  Video, 
  Settings,
  Plane,
  Battery,
  Compass,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function GroundControlStation() {
  const { connections, activeConnection, sendCommand } = useDroneConnections();
  const [selectedTab, setSelectedTab] = useState('flight');
  const [autopilotCommands, setAutopilotCommands] = useState({
    throttle: 0,
    rudder: 0,
    elevator: 0,
    aileron: 0
  });

  // Get active drone data
  const activeDrone = connections.find(c => c.id === activeConnection);
  const telemetry = activeDrone?.telemetry;

  const handleControlChange = (controls: typeof autopilotCommands) => {
    setAutopilotCommands(controls);
    
    // Send manual control if connected
    if (activeConnection) {
      sendCommand(activeConnection, 'MANUAL_CONTROL', controls);
    }
  };

  const handleQuickCommand = (command: string) => {
    if (activeConnection) {
      sendCommand(activeConnection, command);
    }
  };

  const getFlightModeColor = (mode: string) => {
    switch (mode?.toUpperCase()) {
      case 'AUTO': case 'GUIDED': return 'default';
      case 'STABILIZE': case 'ALT_HOLD': return 'secondary';
      case 'RTL': case 'LAND': return 'outline';
      case 'LOITER': return 'secondary';
      default: return 'outline';
    }
  };

  const formatCoordinate = (coord: number): string => {
    return coord?.toFixed(6) || '0.000000';
  };

  const formatTime = (timestamp: number): string => {
    const elapsed = (Date.now() - timestamp) / 1000;
    if (elapsed < 60) return `${Math.floor(elapsed)}s`;
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m`;
    return `${Math.floor(elapsed / 3600)}h`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ground Control Station</h1>
            <p className="text-muted-foreground">
              Professional drone control interface - Compatible with QGroundControl & Mission Planner
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeDrone ? (
              <Badge variant="default" className="px-3 py-1">
                <Radio className="w-3 h-3 mr-1" />
                Connected to {activeDrone.name}
              </Badge>
            ) : (
              <Badge variant="outline" className="px-3 py-1">
                <AlertTriangle className="w-3 h-3 mr-1" />
                No Active Connection
              </Badge>
            )}
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Flight Data */}
          <div className="lg:col-span-1 space-y-4">
            {/* Flight Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plane className="w-5 h-5" />
                  Flight Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {telemetry ? (
                  <>
                    {/* Armed Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Armed:</span>
                      {telemetry.armed ? (
                        <Badge variant="destructive">ARMED</Badge>
                      ) : (
                        <Badge variant="outline">DISARMED</Badge>
                      )}
                    </div>

                    {/* Flight Mode */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Mode:</span>
                      <Badge variant={getFlightModeColor(telemetry.mode) as any}>
                        {telemetry.mode || 'UNKNOWN'}
                      </Badge>
                    </div>

                    {/* Battery */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Battery className="w-3 h-3" />
                          Battery:
                        </span>
                        <span className="text-sm font-mono">
                          {telemetry.battery_voltage?.toFixed(1)}V ({telemetry.battery_remaining}%)
                        </span>
                      </div>
                      <Progress 
                        value={telemetry.battery_remaining || 0} 
                        className="h-2"
                      />
                    </div>

                    {/* GPS */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">GPS:</span>
                        <span className="text-sm font-mono">
                          {telemetry.gps_satellites} sats
                        </span>
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {formatCoordinate(telemetry.gps_lat)}, {formatCoordinate(telemetry.gps_lon)}
                      </div>
                    </div>

                    {/* Altitude & Speed */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Alt:</span>
                        <div className="font-mono">{telemetry.altitude?.toFixed(1)}m</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Speed:</span>
                        <div className="font-mono">{telemetry.groundspeed?.toFixed(1)}m/s</div>
                      </div>
                    </div>

                    {/* Attitude */}
                    <div className="space-y-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Compass className="w-3 h-3" />
                        Attitude:
                      </span>
                      <div className="grid grid-cols-3 gap-1 text-xs font-mono">
                        <div>R: {telemetry.roll?.toFixed(1)}°</div>
                        <div>P: {telemetry.pitch?.toFixed(1)}°</div>
                        <div>Y: {telemetry.yaw?.toFixed(1)}°</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No telemetry data</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Commands */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Commands</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleQuickCommand('ARM')}
                    disabled={!activeConnection}
                  >
                    ARM
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleQuickCommand('DISARM')}
                    disabled={!activeConnection}
                  >
                    DISARM
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleQuickCommand('TAKEOFF')}
                    disabled={!activeConnection}
                  >
                    TAKEOFF
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => handleQuickCommand('RTL')}
                    disabled={!activeConnection}
                  >
                    RTL
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleQuickCommand('LAND')}
                  disabled={!activeConnection}
                >
                  EMERGENCY LAND
                </Button>
              </CardContent>
            </Card>

            {/* Gamepad Controller */}
            <GamepadController 
              onControlChange={handleControlChange}
              onCommand={handleQuickCommand}
            />
          </div>

          {/* Center Panel - Main Interface */}
          <div className="lg:col-span-3">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="flight" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Flight
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  Map
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Video
                </TabsTrigger>
                <TabsTrigger value="connections" className="flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  Connections
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="flight" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Flight Instruments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Primary Flight Display would go here */}
                    <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-dashed border-muted-foreground/20 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Gauge className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Primary Flight Display (PFD)
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Artificial horizon, speed, altitude, navigation data
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="map" className="space-y-4">
                <GlobalMap />
              </TabsContent>

              <TabsContent value="video" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Video Feed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-dashed border-muted-foreground/20 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <Video className="h-12 w-12 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Live Video Feed
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Camera stream from active drone
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="connections" className="space-y-4">
                <DroneConnectionManager />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>GCS Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Configuration settings for Ground Control Station
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Status Bar */}
        <Card className="bg-muted/50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date().toLocaleTimeString()}
                </span>
                {telemetry && (
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Last update: {formatTime(telemetry.timestamp * 1000)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span>Connections: {connections.filter(c => c.status === 'connected').length}</span>
                <span>GCS v1.0.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}