import { useDroneEcosystem } from '@/hooks/use-drone-ecosystem';
import { useMissions } from '@/hooks/use-missions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Plane, 
  Battery, 
  Signal, 
  MapPin, 
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Pause,
  Play,
  Square
} from 'lucide-react';

interface DroneEcosystemIntegratedProps {
  onDroneSelect?: (droneId: string) => void;
  selectedDroneId?: string;
}

export const DroneEcosystemIntegrated: React.FC<DroneEcosystemIntegratedProps> = ({ 
  onDroneSelect, 
  selectedDroneId 
}) => {
  const { drones, missions, loading, error, createMission, updateMissionStatus } = useDroneEcosystem();

  if (loading) {
    return (
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error loading drone ecosystem: {error}
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'mission': return 'default';
      case 'charging': return 'secondary';
      case 'offline': return 'destructive';
      default: return 'outline';
    }
  };

  const getMissionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'planning': return 'outline';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSignalColor = (strength: number) => {
    if (strength > 70) return 'text-green-600';
    if (strength > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleMissionAction = async (missionId: string, action: 'start' | 'pause' | 'stop') => {
    try {
      let newStatus = '';
      switch (action) {
        case 'start':
          newStatus = 'active';
          break;
        case 'pause':
          newStatus = 'paused';
          break;
        case 'stop':
          newStatus = 'completed';
          break;
      }
      await updateMissionStatus(missionId, newStatus);
    } catch (error) {
      console.error('Mission action failed:', error);
    }
  };

  const handleCreateMission = async () => {
    try {
      await createMission({
        name: `Mission ${Date.now()}`,
        status: 'planning'
      });
    } catch (error) {
      console.error('Create mission failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Fleet Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Drones</p>
                <p className="text-2xl font-bold">{drones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold">
                  {drones.filter(d => d.status === 'online' || d.status === 'mission').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Missions</p>
                <p className="text-2xl font-bold">
                  {missions.filter(m => m.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drone Fleet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Drone Fleet Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {drones.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {drones.map((drone) => (
                <Card 
                  key={drone.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedDroneId === drone.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => onDroneSelect?.(drone.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{drone.name}</h4>
                      <Badge variant={getStatusColor(drone.status)}>
                        {drone.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Battery className="h-3 w-3" />
                          <span>Battery:</span>
                        </div>
                        <span className={`font-mono ${getBatteryColor(drone.battery_level || 0)}`}>
                          {drone.battery_level || 0}%
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Signal className="h-3 w-3" />
                          <span>Signal:</span>
                        </div>
                        <span className={`font-mono ${getSignalColor(75)}`}>
                          75%
                        </span>
                      </div>
                      
                      {drone.location_latitude && drone.location_longitude && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-xs text-muted-foreground">
                            {drone.location_latitude.toFixed(4)}, {drone.location_longitude.toFixed(4)}
                          </span>
                        </div>
                      )}
                      
                      {drone.name.includes('TIGER') && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">Mission:</p>
                          <p className="text-sm font-medium truncate">Active patrol</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No drones available. Connect drones to start monitoring.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Mission Control */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Mission Control
          </CardTitle>
          <Button onClick={handleCreateMission} size="sm">
            <Play className="h-4 w-4 mr-2" />
            New Mission
          </Button>
        </CardHeader>
        <CardContent>
          {missions.length > 0 ? (
            <div className="space-y-4">
              {missions.map((mission) => (
                <Card key={mission.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{mission.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Created: {new Date().toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getMissionStatusColor(mission.status)}>
                          {mission.status}
                        </Badge>
                        
                        {mission.status === 'planning' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleMissionAction(mission.id, 'start')}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {mission.status === 'active' && (
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleMissionAction(mission.id, 'pause')}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleMissionAction(mission.id, 'stop')}
                            >
                              <Square className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Assigned Drones:</p>
                        <p className="font-medium">
                          {mission.name.includes('Active') ? '1' : '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration:</p>
                        <p className="font-medium">
                          {mission.starts_at 
                            ? `${Math.round((Date.now() - new Date(mission.starts_at).getTime()) / 60000)}m`
                            : 'Not started'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Progress:</p>
                        <div className="flex items-center gap-2">
                          <Progress value={mission.name.includes('Active') ? 65 : 0} className="h-2 flex-1" />
                          <span className="text-xs">{mission.name.includes('Active') ? 65 : 0}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                No missions found. Create a new mission to get started.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DroneEcosystemIntegrated;