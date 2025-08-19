import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Map, 
  Plane, 
  Activity, 
  Video, 
  Settings, 
  Users,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  StopCircle,
  Battery,
  Signal,
  MapPin
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import JetsonConnectionManager from '@/components/JetsonConnectionManager';
import { DroneEcosystemIntegrated } from '@/components/DroneEcosystemManager/DroneEcosystemIntegrated';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { VPSBridge } from '@/components/VPSBridge';
import { ManualDroneControl } from '@/components/ManualDroneControl';
import { JetsonVPSValidator } from '@/components/JetsonVPSValidator';

const DroneEcosystem: React.FC = () => {
  const { t } = useLanguage();
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null);

  // Mock data for PHASE 1
  const mockDrones = [
    {
      id: '1',
      name: 'TIGER-001',
      status: 'mission',
      battery: 87,
      signal: 95,
      position: { lat: 42.6977, lon: 23.3219 },
      mission: 'Patrol Route Alpha',
      lastUpdate: new Date().toISOString()
    },
    {
      id: '2', 
      name: 'TIGER-002',
      status: 'online',
      battery: 92,
      signal: 88,
      position: { lat: 42.7105, lon: 23.3218 },
      mission: null,
      lastUpdate: new Date().toISOString()
    },
    {
      id: '3',
      name: 'TIGER-003', 
      status: 'charging',
      battery: 23,
      signal: 0,
      position: { lat: 42.6998, lon: 23.3156 },
      mission: null,
      lastUpdate: new Date(Date.now() - 300000).toISOString()
    }
  ];

  const mockMissions = [
    {
      id: '1',
      name: 'Patrol Route Alpha',
      status: 'active',
      drones: ['TIGER-001'],
      progress: 65,
      startTime: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '2',
      name: 'Perimeter Scan',
      status: 'planning', 
      drones: [],
      progress: 0,
      startTime: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mission': return 'bg-primary text-primary-foreground';
      case 'online': return 'bg-success text-success-foreground';
      case 'charging': return 'bg-warning text-warning-foreground';
      case 'offline': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMissionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary text-primary-foreground';
      case 'completed': return 'bg-success text-success-foreground';
      case 'planning': return 'bg-muted text-muted-foreground';
      case 'aborted': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TIGER TECH Drone Ecosystem</h1>
          <p className="text-muted-foreground">
            Global drone fleet management and mission control
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-primary">
            PHASE 1 - PILOT
          </Badge>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      <Tabs defaultValue="validation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="validation" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>🔧 Validation</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center space-x-2">
            <Map className="h-4 w-4" />
            <span>Global Map</span>
          </TabsTrigger>
          <TabsTrigger value="missions" className="flex items-center space-x-2">
            <Plane className="h-4 w-4" />
            <span>Missions</span>
          </TabsTrigger>
          <TabsTrigger value="control" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Manual Control</span>
          </TabsTrigger>
          <TabsTrigger value="telemetry" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Telemetry</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center space-x-2">
            <Video className="h-4 w-4" />
            <span>Media</span>
          </TabsTrigger>
          <TabsTrigger value="jetson" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Jetson</span>
          </TabsTrigger>
          <TabsTrigger value="vps" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>VPS Bridge</span>
          </TabsTrigger>
          <TabsTrigger value="swarm" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Swarm</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="validation" className="space-y-4">
          <JetsonVPSValidator />
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <DroneEcosystemIntegrated 
            onDroneSelect={setSelectedDrone}
            selectedDroneId={selectedDrone}
          />
        </TabsContent>

        <TabsContent value="control" className="space-y-4">
          <ManualDroneControl />
        </TabsContent>

        <TabsContent value="missions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plane className="h-5 w-5" />
                <span>Mission Control</span>
                <Badge variant="secondary">{mockMissions.length} Total</Badge>
              </CardTitle>
              <CardDescription>
                Plan, execute, and monitor drone missions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {mockMissions.map((mission) => (
                  <Card key={mission.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-lg">{mission.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getMissionStatusColor(mission.status)}>
                            {mission.status}
                          </Badge>
                          {mission.status === 'active' && (
                            <div className="flex space-x-1">
                              <Button size="sm" variant="outline">
                                <PauseCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="destructive">
                                <StopCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {mission.status === 'planning' && (
                            <Button size="sm">
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Launch
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Assigned Drones:</p>
                          <p className="font-medium">
                            {mission.drones.length > 0 ? mission.drones.join(', ') : 'None'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Progress:</p>
                          <p className="font-medium">{mission.progress}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration:</p>
                          <p className="font-medium">
                            {mission.startTime 
                              ? `${Math.round((Date.now() - new Date(mission.startTime).getTime()) / 60000)}m`
                              : 'Not started'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telemetry" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Real-time Telemetry</span>
              </CardTitle>
              <CardDescription>
                Live telemetry data streams from active drones
              </CardDescription>
            </CardHeader>
            <CardContent>
          <PerformanceMonitor
            isConnected={true}
            lastUpdate={new Date()}
            telemetryActive={true}
          />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Video className="h-5 w-5" />
                <span>Media & Analytics</span>
              </CardTitle>
              <CardDescription>
                Video feeds, recordings, and AI detections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-dashed border-muted-foreground/20 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Video Feeds & Detection Timeline
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Live video streams with AI detection overlays
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jetson" className="space-y-4">
          <JetsonConnectionManager />
        </TabsContent>

        <TabsContent value="vps" className="space-y-4">
          <VPSBridge />
        </TabsContent>

        <TabsContent value="swarm" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Swarm Coordination</span>
              </CardTitle>
              <CardDescription>
                Collective behavior and formation control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-dashed border-muted-foreground/20 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Swarm Formation & Coordination
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Manage swarm roles, formations, and collective intents
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DroneEcosystem;