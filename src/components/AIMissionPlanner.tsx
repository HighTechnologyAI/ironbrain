import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/neon/Button';
import { StatusChip } from '@/components/neon/StatusChip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MapPin, 
  Plane, 
  Clock, 
  Battery, 
  Thermometer, 
  Gauge,
  Route,
  Brain,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface Waypoint {
  lat: number;
  lon: number;
  alt: number;
  name?: string;
  action?: string;
}

interface MissionPlan {
  title: string;
  description: string;
  drone_id: string;
  waypoints: Waypoint[];
  status: 'planned' | 'active' | 'completed' | 'aborted';
}

export const AIMissionPlanner: React.FC = () => {
  const [mission, setMission] = useState<Partial<MissionPlan>>({
    title: '',
    description: '',
    drone_id: '',
    waypoints: [],
    status: 'planned'
  });
  const [newWaypoint, setNewWaypoint] = useState<Partial<Waypoint>>({
    lat: 42.6977,
    lon: 23.3219,
    alt: 100
  });
  const [aiOptimizing, setAiOptimizing] = useState(false);

  const { data: drones } = useQuery({
    queryKey: ['available-drones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uav_drones')
        .select('*')
        .in('status', ['online', 'ready']);
      
      if (error) throw error;
      return data;
    }
  });

  const saveMissionMutation = useMutation({
    mutationFn: async (missionData: MissionPlan) => {
      const { data, error } = await supabase
        .from('uav_missions')
        .insert({
          title: missionData.title,
          description: missionData.description,
          drone_id: missionData.drone_id,
          waypoints: missionData.waypoints as any, // Type assertion for JSONB
          status: missionData.status,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Mission plan saved successfully');
      setMission({
        title: '',
        description: '',
        drone_id: '',
        waypoints: [],
        status: 'planned'
      });
    },
    onError: (error) => {
      console.error('Save mission failed:', error);
      toast.error('Failed to save mission plan');
    }
  });

  const optimizeMissionMutation = useMutation({
    mutationFn: async (missionData: Partial<MissionPlan>) => {
      const { data, error } = await supabase.functions.invoke('ai-uav-analytics', {
        body: {
          action: 'plan_mission',
          data: {
            title: missionData.title,
            description: missionData.description,
            waypoints: missionData.waypoints,
            drone_id: missionData.drone_id,
            weather: 'clear, 15°C, wind 5 km/h',
            objectives: missionData.description
          }
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('AI optimization completed');
        // Parse AI response for optimized waypoints if available
        console.log('AI Mission Plan:', data.response);
      }
    },
    onError: (error) => {
      console.error('AI optimization failed:', error);
      toast.error('Failed to optimize mission with AI');
    }
  });

  const addWaypoint = () => {
    if (newWaypoint.lat && newWaypoint.lon && newWaypoint.alt) {
      setMission(prev => ({
        ...prev,
        waypoints: [
          ...(prev.waypoints || []),
          {
            lat: newWaypoint.lat!,
            lon: newWaypoint.lon!,
            alt: newWaypoint.alt!,
            name: newWaypoint.name || `Waypoint ${(prev.waypoints?.length || 0) + 1}`,
            action: newWaypoint.action || 'hover'
          }
        ]
      }));
      setNewWaypoint({
        lat: newWaypoint.lat,
        lon: newWaypoint.lon,
        alt: newWaypoint.alt! + 10
      });
    }
  };

  const removeWaypoint = (index: number) => {
    setMission(prev => ({
      ...prev,
      waypoints: prev.waypoints?.filter((_, i) => i !== index) || []
    }));
  };

  const handleOptimizeWithAI = () => {
    if (mission.waypoints && mission.waypoints.length > 0) {
      optimizeMissionMutation.mutate(mission);
    } else {
      toast.error('Add waypoints before AI optimization');
    }
  };

  const handleSaveMission = () => {
    if (!mission.title || !mission.drone_id || !mission.waypoints?.length) {
      toast.error('Please fill in all required fields and add waypoints');
      return;
    }
    saveMissionMutation.mutate(mission as MissionPlan);
  };

  const estimatedFlightTime = mission.waypoints?.length ? (mission.waypoints.length * 2) + 5 : 0;
  const estimatedBatteryUsage = estimatedFlightTime * 1.5; // Rough estimate

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            AI Mission Planner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mission-title">Mission Title</Label>
              <Input
                id="mission-title"
                placeholder="Survey Mission Alpha"
                value={mission.title || ''}
                onChange={(e) => setMission(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="drone-select">Select Drone</Label>
              <Select value={mission.drone_id || ''} onValueChange={(value) => setMission(prev => ({ ...prev, drone_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose available drone" />
                </SelectTrigger>
                <SelectContent>
                  {drones?.map((drone) => (
                    <SelectItem key={drone.id} value={drone.id}>
                      <div className="flex items-center gap-2">
                        <Plane className="h-4 w-4" />
                        <span>{drone.name || drone.serial}</span>
                        <StatusChip status="online" size="sm">
                          {drone.status}
                        </StatusChip>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mission-description">Mission Description</Label>
            <Textarea
              id="mission-description"
              placeholder="Describe the mission objectives and requirements..."
              value={mission.description || ''}
              onChange={(e) => setMission(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Waypoints
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Latitude</Label>
              <Input
                type="number"
                step="0.000001"
                placeholder="42.697708"
                value={newWaypoint.lat || ''}
                onChange={(e) => setNewWaypoint(prev => ({ ...prev, lat: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Longitude</Label>
              <Input
                type="number"
                step="0.000001"
                placeholder="23.321844"
                value={newWaypoint.lon || ''}
                onChange={(e) => setNewWaypoint(prev => ({ ...prev, lon: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Altitude (m)</Label>
              <Input
                type="number"
                placeholder="100"
                value={newWaypoint.alt || ''}
                onChange={(e) => setNewWaypoint(prev => ({ ...prev, alt: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input
                placeholder="Waypoint"
                value={newWaypoint.name || ''}
                onChange={(e) => setNewWaypoint(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">&nbsp;</Label>
              <Button onClick={addWaypoint} size="sm" variant="neon" className="w-full">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {mission.waypoints && mission.waypoints.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Flight Path ({mission.waypoints.length} waypoints)</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {mission.waypoints.map((waypoint, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{waypoint.name}</div>
                        <div className="text-muted-foreground font-mono text-xs">
                          {waypoint.lat.toFixed(6)}, {waypoint.lon.toFixed(6)} @ {waypoint.alt}m
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWaypoint(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {mission.waypoints && mission.waypoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-5 w-5" />
              Mission Estimates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Flight Time</div>
                  <div className="font-medium">{estimatedFlightTime} min</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Battery className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Battery Usage</div>
                  <div className="font-medium">{estimatedBatteryUsage.toFixed(1)}%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Waypoints</div>
                  <div className="font-medium">{mission.waypoints.length}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Distance</div>
                  <div className="font-medium">~{(mission.waypoints.length * 0.5).toFixed(1)} km</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleOptimizeWithAI}
          disabled={optimizeMissionMutation.isPending || !mission.waypoints?.length}
          variant="neon-outline"
          className="flex-1"
        >
          {optimizeMissionMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Optimizing...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 mr-2" />
              Optimize with AI
            </>
          )}
        </Button>
        
        <Button
          onClick={handleSaveMission}
          disabled={saveMissionMutation.isPending || !mission.title || !mission.drone_id || !mission.waypoints?.length}
          variant="neon"
          className="flex-1"
        >
          {saveMissionMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Route className="h-4 w-4 mr-2" />
              Save Mission Plan
            </>
          )}
        </Button>
      </div>
    </div>
  );
};