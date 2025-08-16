import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  MapPin, 
  Clock, 
  Route,
  Plane,
  Battery,
  Signal
} from 'lucide-react';
import { MissionService } from '@/services/missionService';
import { DroneService } from '@/services/droneService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/use-toast';

interface Mission {
  id: string;
  name: string;
  description?: string;
  status: string; // Allow any string from database
  progress: number;
  drone_id?: string;
  waypoints: number;
  altitude_meters: number;
  start_time?: string;
  end_time?: string;
  created_at: string;
}

interface MissionDetailsProps {
  missionId: string;
  onClose?: () => void;
}

const MissionDetails: React.FC<MissionDetailsProps> = ({ missionId, onClose }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: mission, isLoading } = useQuery({
    queryKey: ['mission', missionId],
    queryFn: () => MissionService.getMissionById(missionId),
    select: (data) => data.data
  });

  const { data: drones } = useQuery({
    queryKey: ['drones'],
    queryFn: () => DroneService.getDrones(),
    select: (data) => data.data || []
  });

  const updateMissionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      MissionService.updateMission(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mission', missionId] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      toast({
        title: t('missions.updated'),
        description: t('missions.updateSuccess')
      });
    },
    onError: (error) => {
      toast({
        title: t('missions.updateError'),
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleStatusChange = (newStatus: string) => {
    if (!mission) return;
    
    const updates: any = { status: newStatus };
    
    if (newStatus === 'active') {
      updates.start_time = new Date().toISOString();
    } else if (['completed', 'aborted'].includes(newStatus)) {
      updates.end_time = new Date().toISOString();
    }
    
    updateMissionMutation.mutate({ id: mission.id, updates });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-500/20 text-blue-700';
      case 'ready': return 'bg-green-500/20 text-green-700';
      case 'active': return 'bg-orange-500/20 text-orange-700';
      case 'completed': return 'bg-emerald-500/20 text-emerald-700';
      case 'aborted': return 'bg-red-500/20 text-red-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

  const assignedDrone = drones?.find(d => d.id === mission?.drone_id);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mission) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">{t('missions.notFound')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {mission.name}
          </CardTitle>
          <Badge className={getStatusColor(mission.status)}>
            {t(`missions.status.${mission.status}`)}
          </Badge>
        </div>
        {mission.description && (
          <p className="text-sm text-muted-foreground">{mission.description}</p>
        )}
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t('missions.overview')}</TabsTrigger>
            <TabsTrigger value="waypoints">{t('missions.waypoints')}</TabsTrigger>
            <TabsTrigger value="telemetry">{t('missions.telemetry')}</TabsTrigger>
            <TabsTrigger value="controls">{t('missions.controls')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Route className="h-4 w-4" />
                  <span>{t('missions.waypoints')}: {mission.waypoints}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{t('missions.altitude')}: {mission.altitude_meters}m</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{t('missions.altitude')}: {mission.altitude_meters}m</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {assignedDrone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Plane className="h-4 w-4" />
                    <span>{t('missions.assignedDrone')}: {assignedDrone.name}</span>
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  {t('missions.created')}: {new Date(mission.created_at).toLocaleString()}
                </div>
              </div>
            </div>
            
            {mission.status === 'active' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('missions.progress')}</span>
                  <span>{mission.progress}%</span>
                </div>
                <Progress value={mission.progress} className="w-full" />
              </div>
            )}
            
            {(mission.start_time || mission.end_time) && (
              <div className="border-t pt-4 space-y-2">
                {mission.start_time && (
                  <div className="text-sm">
                    <span className="font-medium">{t('missions.startTime')}: </span>
                    {new Date(mission.start_time).toLocaleString()}
                  </div>
                )}
                {mission.end_time && (
                  <div className="text-sm">
                    <span className="font-medium">{t('missions.endTime')}: </span>
                    {new Date(mission.end_time).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="waypoints" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Route className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('missions.waypointsPlaceholder')}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="telemetry" className="space-y-4">
            {assignedDrone ? (
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Battery className="h-4 w-4" />
                      <span className="text-sm font-medium">{t('telemetry.battery')}</span>
                    </div>
                    <div className="text-2xl font-bold">{assignedDrone.battery_level || 0}%</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Signal className="h-4 w-4" />
                      <span className="text-sm font-medium">{t('telemetry.signal')}</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {assignedDrone.status === 'online' ? 'Strong' : 'Weak'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('missions.noDroneAssigned')}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="controls" className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {mission.status === 'planning' && (
                <Button 
                  onClick={() => handleStatusChange('ready')}
                  disabled={updateMissionMutation.isPending}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  {t('missions.makeReady')}
                </Button>
              )}
              
              {mission.status === 'ready' && (
                <Button 
                  onClick={() => handleStatusChange('active')}
                  disabled={updateMissionMutation.isPending}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  {t('missions.start')}
                </Button>
              )}
              
              {mission.status === 'active' && (
                <>
                  <Button 
                    onClick={() => handleStatusChange('completed')}
                    disabled={updateMissionMutation.isPending}
                    variant="outline"
                    className="gap-2"
                  >
                    <Square className="h-4 w-4" />
                    {t('missions.complete')}
                  </Button>
                  
                  <Button 
                    onClick={() => handleStatusChange('aborted')}
                    disabled={updateMissionMutation.isPending}
                    variant="destructive"
                    className="gap-2"
                  >
                    <Square className="h-4 w-4" />
                    {t('missions.abort')}
                  </Button>
                </>
              )}
              
              {['completed', 'aborted'].includes(mission.status) && (
                <Button 
                  onClick={() => handleStatusChange('planning')}
                  disabled={updateMissionMutation.isPending}
                  variant="outline"
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  {t('missions.restart')}
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default MissionDetails;