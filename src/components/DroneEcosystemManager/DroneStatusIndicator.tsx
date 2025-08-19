import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Clock, Wrench } from 'lucide-react';

interface DroneStatusIndicatorProps {
  status: 'online' | 'offline' | 'mission' | 'maintenance' | 'charging';
  count: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const DroneStatusIndicator: React.FC<DroneStatusIndicatorProps> = ({
  status,
  count,
  size = 'sm',
  showIcon = true
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-3 w-3" />;
      case 'mission':
        return <AlertTriangle className="h-3 w-3" />;
      case 'offline':
        return <XCircle className="h-3 w-3" />;
      case 'maintenance':
        return <Wrench className="h-3 w-3" />;
      case 'charging':
        return <Clock className="h-3 w-3" />;
      default:
        return <XCircle className="h-3 w-3" />;
    }
  };

  const getStatusVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'online':
        return 'default';
      case 'mission':
        return 'secondary';
      case 'offline':
      case 'maintenance':
        return 'destructive';
      case 'charging':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'mission':
        return 'Mission';
      case 'offline':
        return 'Offline';
      case 'maintenance':
        return 'Maintenance';
      case 'charging':
        return 'Charging';
      default:
        return 'Unknown';
    }
  };

  return (
    <Badge variant={getStatusVariant()} className="gap-1">
      {showIcon && getStatusIcon()}
      <span>{getStatusLabel()}</span>
      <span className="ml-1 font-bold">{count}</span>
    </Badge>
  );
};

export default DroneStatusIndicator;