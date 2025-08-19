import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Plane, 
  Battery, 
  Signal, 
  MapPin, 
  Clock, 
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { DroneService } from '@/services/droneService';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { DroneCard } from './DroneCard';
import { DroneStatusIndicator } from './DroneStatusIndicator';

interface Drone {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  status: string; // Allow any string from database
  battery_level: number;
  location_latitude?: number;
  location_longitude?: number;
  altitude_meters?: number;
  speed_ms?: number;
  flight_time_hours?: number;
  last_maintenance?: string;
  is_active?: boolean;
}

interface DroneListProps {
  onSelectDrone?: (drone: Drone) => void;
  selectedDroneId?: string;
  layout?: 'grid' | 'list';
  telemetryData?: Record<string, any>;
  onDroneCommand?: (droneId: string, command: string) => void;
}

const DroneList: React.FC<DroneListProps> = ({
  onSelectDrone,
  selectedDroneId,
  layout = 'grid',
  telemetryData,
  onDroneCommand
}) => {
  const { t } = useTranslation();
  
  const { data: drones, isLoading, error } = useQuery({
    queryKey: ['drones'],
    queryFn: () => DroneService.getDrones(),
    select: (data) => data.data || []
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'mission': return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'charging': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'maintenance': return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      case 'offline': return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Signal className="h-3 w-3" />;
      case 'mission': return <Play className="h-3 w-3" />;
      case 'charging': return <Battery className="h-3 w-3" />;
      case 'maintenance': return <Settings className="h-3 w-3" />;
      case 'offline': return <Pause className="h-3 w-3" />;
      default: return <Pause className="h-3 w-3" />;
    }
  };

  const getBatteryColor = (level: number) => {
    if (level >= 60) return 'text-green-600';
    if (level >= 30) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-20 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">{t('drones.loadError')}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            <RotateCcw className="h-4 w-4 mr-2" />
            {t('common.retry')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!drones || drones.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Plane className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">{t('drones.empty.title')}</h3>
          <p className="text-muted-foreground mb-4">{t('drones.empty.description')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
      {drones.map((drone: Drone) => (
        <Card
          key={drone.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedDroneId === drone.id 
              ? 'border-primary bg-primary/5 shadow-sm' 
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => onSelectDrone?.(drone)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plane className="h-5 w-5" />
                {drone.name}
              </CardTitle>
              <Badge 
                variant="outline" 
                className={`gap-1 ${getStatusColor(drone.status)}`}
              >
                {getStatusIcon(drone.status)}
                {t(`drone.status.${drone.status}`)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {drone.manufacturer} {drone.model}
            </p>
          </CardHeader>
          
          <CardContent>
            {/* Battery Level */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Battery className="h-4 w-4" />
                  <span>{t('telemetry.battery')}</span>
                </div>
                <span className={`font-medium ${getBatteryColor(drone.battery_level)}`}>
                  {drone.battery_level}%
                </span>
              </div>
              <Progress 
                value={drone.battery_level} 
                className="h-2"
                style={{
                  background: drone.battery_level >= 60 ? 'rgb(34, 197, 94)' : 
                              drone.battery_level >= 30 ? 'rgb(249, 115, 22)' : 
                              'rgb(239, 68, 68)'
                }}
              />
            </div>
            
            {/* Location & Altitude */}
            {drone.location_latitude && drone.location_longitude && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{t('telemetry.location')}</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {drone.location_latitude.toFixed(6)}, {drone.location_longitude.toFixed(6)}
                </div>
                {drone.altitude_meters !== undefined && (
                  <div className="text-sm">
                    {t('telemetry.altitude')}: <span className="font-medium">{drone.altitude_meters}m</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Flight Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{t('drone.flightTime')}</span>
                </div>
                <div className="font-medium">{drone.flight_time_hours || 0}h</div>
              </div>
              
              {drone.speed_ms !== undefined && (
                <div>
                  <div className="text-muted-foreground">{t('telemetry.speed')}</div>
                  <div className="font-medium">{drone.speed_ms.toFixed(1)} m/s</div>
                </div>
              )}
            </div>
            
            {/* Last Maintenance */}
            {drone.last_maintenance && (
              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                {t('drone.lastMaintenance')}: {new Date(drone.last_maintenance).toLocaleDateString()}
              </div>
            )}
            
            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle quick action
                }}
              >
                <Settings className="h-3 w-3" />
                {t('drone.configure')}
              </Button>
              
              {drone.status === 'online' && (
                <Button 
                  size="sm" 
                  variant="default" 
                  className="flex-1 gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle mission start
                  }}
                >
                  <Play className="h-3 w-3" />
                  {t('drone.startMission')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DroneList;