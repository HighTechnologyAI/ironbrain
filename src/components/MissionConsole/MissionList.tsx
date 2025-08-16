import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Play, Pause, Square, Clock, MapPin } from 'lucide-react';
import { MissionService } from '@/services/missionService';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

interface Mission {
  id: string;
  name: string;
  status: string; // Allow any string from database
  progress: number;
  drone_id?: string;
  waypoints: number;
  created_at: string;
  description?: string;
  altitude_meters?: number;
}

interface MissionListProps {
  onSelectMission?: (mission: Mission) => void;
  onCreateMission?: () => void;
  selectedMissionId?: string;
}

const MissionList: React.FC<MissionListProps> = ({
  onSelectMission,
  onCreateMission,
  selectedMissionId
}) => {
  const { t } = useTranslation();
  
  const { data: missions, isLoading, error } = useQuery({
    queryKey: ['missions'],
    queryFn: () => MissionService.getMissions(),
    select: (data) => data.data || []
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'ready': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'active': return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30';
      case 'aborted': return 'bg-red-500/20 text-red-700 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'planning': return <Clock className="h-3 w-3" />;
      case 'ready': return <Play className="h-3 w-3" />;
      case 'active': return <Pause className="h-3 w-3" />;
      case 'completed': return <Square className="h-3 w-3" />;
      case 'aborted': return <Square className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('missions.list')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('missions.list')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">
            {t('missions.loadError')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('missions.list')}
          </div>
          {onCreateMission && (
            <Button onClick={onCreateMission} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              {t('missions.create')}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {missions?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('missions.empty')}</p>
              {onCreateMission && (
                <Button 
                  onClick={onCreateMission} 
                  variant="outline" 
                  className="mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t('missions.createFirst')}
                </Button>
              )}
            </div>
          ) : (
            missions?.map((mission: Mission) => (
              <div
                key={mission.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedMissionId === mission.id 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onSelectMission?.(mission)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-sm">{mission.name}</h3>
                  <Badge 
                    variant="outline" 
                    className={`gap-1 ${getStatusColor(mission.status)}`}
                  >
                    {getStatusIcon(mission.status)}
                    {t(`missions.status.${mission.status}`)}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>{mission.waypoints} waypoints</span>
                  <span>{mission.altitude_meters || 100}m alt</span>
                </div>
                
                {mission.status === 'active' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{t('missions.progress')}</span>
                      <span>{mission.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all" 
                        style={{ width: `${mission.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-muted-foreground mt-2">
                  {t('missions.created')}: {new Date(mission.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MissionList;