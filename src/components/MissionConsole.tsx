import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDroneEcosystem } from '@/hooks/use-drone-ecosystem';
import { 
  Play, 
  Pause, 
  Square, 
  MapPin, 
  Clock, 
  Users, 
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

export default function MissionConsole() {
  const { drones, missions, createMission, updateMissionStatus, assignDroneToMission } = useDroneEcosystem();
  const [selectedMission, setSelectedMission] = useState<string | null>(null);
  const [newMissionData, setNewMissionData] = useState({
    name: '',
    description: '',
    priority: 'medium',
    estimatedDuration: ''
  });

  const handleCreateMission = async () => {
    if (!newMissionData.name) {
      toast.error('Mission name is required');
      return;
    }

    const result = await createMission({
      name: newMissionData.name,
      status: 'planning'
    });

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Mission created successfully');
      setNewMissionData({ name: '', description: '', priority: 'medium', estimatedDuration: '' });
    }
  };

  const handleMissionAction = async (missionId: string, action: string) => {
    const statusMap: Record<string, string> = {
      start: 'active',
      pause: 'paused',
      stop: 'completed',
      abort: 'aborted'
    };

    const result = await updateMissionStatus(missionId, statusMap[action] || 'planning');
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Mission ${action}ed successfully`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4 text-green-500" />;
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'aborted': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'completed': return 'outline';
      case 'aborted': return 'destructive';
      default: return 'outline';
    }
  };

  const activeMissions = missions.filter(m => ['active', 'paused'].includes(m.status));
  const completedMissions = missions.filter(m => ['completed', 'aborted'].includes(m.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mission Control Console</h2>
        <div className="flex gap-2">
          <Badge variant="outline">
            <Target className="w-3 h-3 mr-1" />
            {activeMissions.length} Active
          </Badge>
          <Badge variant="outline">
            <Users className="w-3 h-3 mr-1" />
            {drones.filter(d => d.status !== 'offline').length} Available Drones
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Missions</TabsTrigger>
          <TabsTrigger value="planning">Mission Planning</TabsTrigger>
          <TabsTrigger value="history">Mission History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeMissions.length === 0 ? (
            <Card className="p-8 text-center">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Missions</h3>
              <p className="text-muted-foreground">Create a new mission to get started.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeMissions.map(mission => (
                <Card key={mission.id} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(mission.status)}
                      <h3 className="text-lg font-semibold">{mission.name}</h3>
                      <Badge variant={getStatusColor(mission.status) as any}>
                        {mission.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {mission.status === 'active' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMissionAction(mission.id, 'pause')}
                        >
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      {mission.status === 'paused' && (
                        <Button 
                          size="sm"
                          onClick={() => handleMissionAction(mission.id, 'start')}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Resume
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleMissionAction(mission.id, 'abort')}
                      >
                        <Square className="w-4 h-4 mr-1" />
                        Abort
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Mission Details</Label>
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          Started: {mission.starts_at ? new Date(mission.starts_at).toLocaleString() : 'Not set'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3" />
                          Location: Dynamic
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Assigned Drones</Label>
                      <div className="space-y-1">
                        {mission.assigned_drones?.map(droneId => {
                          const drone = drones.find(d => d.id === droneId);
                          return (
                            <div key={droneId} className="flex items-center gap-2 text-sm">
                              <div className={`w-2 h-2 rounded-full ${
                                drone?.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                              }`} />
                              {drone?.name || 'Unknown Drone'}
                            </div>
                          );
                        }) || (
                          <div className="text-sm text-muted-foreground">No drones assigned</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Progress</Label>
                      <div className="space-y-2">
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: '45%' }}
                          />
                        </div>
                        <div className="text-sm text-muted-foreground">45% Complete</div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="planning" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Mission</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mission-name">Mission Name</Label>
                  <Input
                    id="mission-name"
                    placeholder="Enter mission name..."
                    value={newMissionData.name}
                    onChange={(e) => setNewMissionData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mission-priority">Priority</Label>
                  <Select 
                    value={newMissionData.priority} 
                    onValueChange={(value) => setNewMissionData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mission-duration">Estimated Duration (hours)</Label>
                  <Input
                    id="mission-duration"
                    type="number"
                    placeholder="2"
                    value={newMissionData.estimatedDuration}
                    onChange={(e) => setNewMissionData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mission-description">Mission Description</Label>
                  <Textarea
                    id="mission-description"
                    placeholder="Describe the mission objectives..."
                    rows={4}
                    value={newMissionData.description}
                    onChange={(e) => setNewMissionData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <Button onClick={handleCreateMission} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Mission
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Available Drones</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {drones.filter(d => d.status !== 'offline').map(drone => (
                <div key={drone.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{drone.name || 'Drone'}</span>
                    <Badge variant={drone.status === 'online' ? 'default' : 'secondary'}>
                      {drone.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Zap className="w-3 h-3" />
                      Battery: {drone.battery_level || 0}%
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      Altitude: {drone.altitude_meters || 0}m
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {completedMissions.map(mission => (
              <Card key={mission.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(mission.status)}
                    <div>
                      <h3 className="font-semibold">{mission.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Completed: {mission.ends_at ? new Date(mission.ends_at).toLocaleString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(mission.status) as any}>
                    {mission.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}