import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MapPin, 
  Plus, 
  Calendar,
  Clock,
  Plane,
  Users
} from 'lucide-react';
import { MissionService, type ExtendedMission, type MissionWaypoint } from '@/services/missionService';
import { WaypointEditor } from './WaypointEditor';
import { MissionStatus } from './MissionStatus';
import { useToast } from '@/hooks/use-toast';

export const EnhancedMissionDetails: React.FC<{ missionId?: string }> = ({ missionId }) => {
  const [selectedMission, setSelectedMission] = useState<ExtendedMission | null>(null);
  const [waypoints, setWaypoints] = useState<MissionWaypoint[]>([]);
  const [showWaypointEditor, setShowWaypointEditor] = useState(false);
  const { toast } = useToast();

  // Fetch missions
  const { data: missions, isLoading } = useQuery({
    queryKey: ['extended-missions'],
    queryFn: async () => {
      const { data, error } = await MissionService.getExtendedMissions();
      if (error) throw error;
      return data || [];
    }
  });

  // Load mission details when missionId changes
  useEffect(() => {
    if (missionId && missions) {
      const mission = missions.find(m => m.id === missionId);
      setSelectedMission(mission || null);
    }
  }, [missionId, missions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'paused': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateMission = async () => {
    try {
      const newMission = {
        name: `Mission ${Date.now()}`,
        status: 'planning' as const,
        // org_id will be set automatically by RLS
      };

      const { data, error } = await MissionService.createExtendedMission(newMission);
      
      if (error) {
        toast({
          title: "Error creating mission",
          description: error.message,
          variant: "destructive"
        });
      } else if (data) {
        setSelectedMission(data);
        toast({
          title: "Mission created",
          description: "New mission created successfully"
        });
      }
    } catch (error) {
      console.error('Error creating mission:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mission Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Mission Control
            </CardTitle>
            <Button onClick={handleCreateMission}>
              <Plus className="h-4 w-4 mr-2" />
              New Mission
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {missions?.map((mission) => (
                <div
                  key={mission.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedMission?.id === mission.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedMission(mission)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{mission.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Created: {formatDate(mission.created_at)}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(mission.status)}>
                      {mission.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Mission Details & Controls */}
      {selectedMission && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mission Status */}
          <MissionStatus 
            mission={{
              id: selectedMission.id,
              name: selectedMission.name,
              status: selectedMission.status as any,
              progress: 0, // TODO: Calculate from waypoints
              waypoints: waypoints.length,
              currentWaypoint: 1,
              estimatedTime: '00:00',
              startTime: selectedMission.starts_at
            }}
            onStart={() => MissionService.startMission(selectedMission.id)}
            onPause={() => MissionService.pauseMission(selectedMission.id)}
            onStop={() => MissionService.failMission(selectedMission.id)}
          />

          {/* Mission Info */}
          <Card>
            <CardHeader>
              <CardTitle>Mission Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Created: {formatDate(selectedMission.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Updated: {formatDate(selectedMission.updated_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Waypoints: {waypoints.length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Org: {selectedMission.org_id?.slice(0, 8)}...</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mission Progress</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>

              <Button 
                onClick={() => setShowWaypointEditor(!showWaypointEditor)}
                variant="outline"
                className="w-full"
              >
                {showWaypointEditor ? 'Hide' : 'Show'} Waypoint Editor
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Waypoint Editor */}
      {selectedMission && showWaypointEditor && (
        <WaypointEditor 
          missionId={selectedMission.id}
          onWaypointsChange={setWaypoints}
        />
      )}
    </div>
  );
};

export default EnhancedMissionDetails;