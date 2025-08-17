import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  MapPin,
  Battery,
  Signal
} from 'lucide-react';

interface MissionStatusProps {
  mission?: {
    id: string;
    name: string;
    status: 'planning' | 'active' | 'paused' | 'completed' | 'failed';
    progress: number;
    waypoints: number;
    currentWaypoint: number;
    estimatedTime: string;
    startTime?: string;
  };
  onStart?: () => void;
  onPause?: () => void;
  onStop?: () => void;
}

export const MissionStatus: React.FC<MissionStatusProps> = ({
  mission,
  onStart,
  onPause,
  onStop
}) => {
  if (!mission) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No mission selected
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'paused': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{mission.name}</span>
          <Badge variant={getStatusColor(mission.status)} className="flex items-center gap-1">
            {getStatusIcon(mission.status)}
            {mission.status.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{mission.progress}%</span>
          </div>
          <Progress value={mission.progress} className="h-2" />
        </div>

        {/* Mission Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>Waypoint {mission.currentWaypoint} of {mission.waypoints}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>ETA: {mission.estimatedTime}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          {mission.status === 'planning' && (
            <Button onClick={onStart} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Start Mission
            </Button>
          )}
          
          {mission.status === 'active' && (
            <>
              <Button onClick={onPause} variant="outline" className="flex-1">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button onClick={onStop} variant="destructive" className="flex-1">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </>
          )}
          
          {mission.status === 'paused' && (
            <>
              <Button onClick={onStart} className="flex-1">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
              <Button onClick={onStop} variant="destructive" className="flex-1">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>

        {/* System Status */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Battery className="h-4 w-4 text-green-500" />
            <span>Battery: 85%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Signal className="h-4 w-4 text-green-500" />
            <span>Signal: Strong</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MissionStatus;