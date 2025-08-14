import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusChip } from '@/components/neon/StatusChip';
import { Button } from '@/components/neon/Button';
import { Switch } from '@/components/ui/switch';
import MapComponent from '@/components/MapComponent';
import { EmptyState } from '@/components/neon/EmptyState';
import { useRealTimeTelemetry, useMockTelemetry } from '@/hooks/use-real-time-telemetry';
import { TelemetryDisplay } from '@/hooks/use-telemetry';
import { Map, Navigation, Radio, Gauge, Battery, Thermometer, Play, Square } from 'lucide-react';

const MissionControl: React.FC = () => {
  const { t } = useTranslation();
  const [demoMode, setDemoMode] = useState(false);
  const [selectedDrone] = useState('demo-drone-1');

  // Feature flag check
  if (import.meta.env.VITE_FEATURE_MISSION_CONTROL !== 'true') {
    return null;
  }

  // Real telemetry data
  const { latestData: realTelemetry, isLoading, connectionStatus } = useRealTimeTelemetry(selectedDrone);
  
  // Mock telemetry for demo
  const mockTelemetry = useMockTelemetry(demoMode);
  
  // Use mock data if demo mode is on, otherwise use real data
  const currentTelemetry = demoMode ? mockTelemetry : realTelemetry;

  // Mock waypoints for demonstration
  const waypoints = [
    { lat: 42.6977, lon: 23.3219, name: 'Start Point' },
    { lat: 42.7077, lon: 23.3319, name: 'Checkpoint 1' },
    { lat: 42.7177, lon: 23.3419, name: 'End Point' },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('ops.missionControl.title', 'Mission Control')}
            </h1>
            <p className="text-muted-foreground">
              {t('ops.missionControl.subtitle', 'UAV flight management')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={demoMode}
                onCheckedChange={setDemoMode}
                id="demo-mode"
              />
              <label htmlFor="demo-mode" className="text-sm font-medium">
                Demo Mode
              </label>
            </div>
            <StatusChip 
              status={connectionStatus === 'connected' && currentTelemetry ? 'online' : 'offline'} 
              size="sm"
            >
              {connectionStatus === 'connected' && currentTelemetry ? 'Live Data' : 
               connectionStatus === 'connecting' ? 'Connecting...' : 'No Signal'}
            </StatusChip>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flight Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              {t('ops.missionControl.map', 'Flight Map')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <MapComponent
              telemetryData={currentTelemetry ? {
                lat: currentTelemetry.lat,
                lon: currentTelemetry.lon,
                alt: currentTelemetry.alt,
                heading: 45 // Mock heading for demo
              } : undefined}
              waypoints={waypoints}
              className="h-96"
            />
          </CardContent>
        </Card>

        {/* Live Telemetry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              {t('ops.missionControl.telemetry', 'Live Telemetry')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && !demoMode ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : (
              <TelemetryDisplay data={currentTelemetry} />
            )}
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status</span>
                <StatusChip status={currentTelemetry ? 'ok' : 'offline'} size="sm">
                  {currentTelemetry ? 'Flying' : 'Offline'}
                </StatusChip>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mission Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Mission Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="neon" size="sm" className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Start Mission
              </Button>
              <Button variant="destructive" size="sm" className="w-full">
                <Square className="h-4 w-4 mr-2" />
                Abort Mission
              </Button>
            </div>
            
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span>Mission Progress</span>
                <span className="font-mono">0/3 waypoints</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Flight Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentTelemetry ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Max Alt</span>
                    <span className="font-mono">120m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Max Speed</span>
                    <span className="font-mono">15 m/s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Home Distance</span>
                    <span className="font-mono">0.8 km</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Flight Time</span>
                    <span className="font-mono">00:12:34</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-mono">~15 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">GPS Sats</span>
                    <span className="font-mono">{currentTelemetry.payload?.satellites || 12}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No active mission
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MissionControl;