import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Database, 
  Shield, 
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface SystemComponent {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  description: string;
  metrics?: {
    value: number;
    unit: string;
    threshold?: number;
  };
  lastCheck: string;
}

interface SystemStatusProps {
  components?: SystemComponent[];
}

const mockComponents: SystemComponent[] = [
  {
    id: 'web_server',
    name: 'Web Server',
    status: 'healthy',
    description: 'Lovable frontend serving user interface',
    metrics: { value: 2, unit: 'ms', threshold: 100 },
    lastCheck: '2025-01-17T10:30:00Z'
  },
  {
    id: 'supabase_db',
    name: 'Supabase Database',
    status: 'healthy', 
    description: 'Primary database for mission and drone data',
    metrics: { value: 15, unit: 'ms', threshold: 50 },
    lastCheck: '2025-01-17T10:30:00Z'
  },
  {
    id: 'auth_service',
    name: 'Authentication Service',
    status: 'healthy',
    description: 'User authentication and authorization',
    metrics: { value: 5, unit: 'ms', threshold: 100 },
    lastCheck: '2025-01-17T10:30:00Z'
  },
  {
    id: 'telemetry_ingestion',
    name: 'Telemetry Ingestion',
    status: 'warning',
    description: 'Real-time drone telemetry processing',
    metrics: { value: 150, unit: 'ms', threshold: 100 },
    lastCheck: '2025-01-17T10:29:00Z'
  },
  {
    id: 'video_stream',
    name: 'Video Streaming',
    status: 'healthy',
    description: 'NVENC video stream processing',
    metrics: { value: 85, unit: '%', threshold: 90 },
    lastCheck: '2025-01-17T10:30:00Z'
  },
  {
    id: 'mavlink_bridge',
    name: 'MAVLink Bridge',
    status: 'healthy',
    description: 'Drone communication protocol handler',
    metrics: { value: 12, unit: 'ms', threshold: 50 },
    lastCheck: '2025-01-17T10:30:00Z'
  },
  {
    id: 'edge_functions',
    name: 'Edge Functions',
    status: 'healthy',
    description: 'Serverless backend processing',
    metrics: { value: 45, unit: 'ms', threshold: 200 },
    lastCheck: '2025-01-17T10:30:00Z'
  },
  {
    id: 'storage_service',
    name: 'Storage Service',
    status: 'critical',
    description: 'File and media storage',
    metrics: { value: 95, unit: '%', threshold: 85 },
    lastCheck: '2025-01-17T10:25:00Z'
  }
];

export const SystemStatus: React.FC<SystemStatusProps> = ({
  components = mockComponents
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      case 'offline': return 'outline';
      default: return 'secondary';
    }
  };

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'web_server': return <Server className="h-4 w-4" />;
      case 'supabase_db': return <Database className="h-4 w-4" />;
      case 'auth_service': return <Shield className="h-4 w-4" />;
      case 'telemetry_ingestion': return <Activity className="h-4 w-4" />;
      case 'video_stream': return <Wifi className="h-4 w-4" />;
      case 'mavlink_bridge': return <Wifi className="h-4 w-4" />;
      case 'edge_functions': return <Cpu className="h-4 w-4" />;
      case 'storage_service': return <HardDrive className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const healthyCount = components.filter(c => c.status === 'healthy').length;
  const warningCount = components.filter(c => c.status === 'warning').length;
  const criticalCount = components.filter(c => c.status === 'critical').length;
  const offlineCount = components.filter(c => c.status === 'offline').length;

  const overallHealth = (healthyCount / components.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          System Status
        </CardTitle>
        
        {/* Overall Health */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall System Health</span>
            <span>{Math.round(overallHealth)}%</span>
          </div>
          <Progress value={overallHealth} className="h-2" />
        </div>

        {/* Status Summary */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>{healthyCount} Healthy</span>
          </div>
          {warningCount > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>{warningCount} Warning</span>
            </div>
          )}
          {criticalCount > 0 && (
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>{criticalCount} Critical</span>
            </div>
          )}
          {offlineCount > 0 && (
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-gray-500" />
              <span>{offlineCount} Offline</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {components.map((component) => (
            <div
              key={component.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground">
                  {getServiceIcon(component.id)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{component.name}</h4>
                    {getStatusIcon(component.status)}
                    <Badge variant={getStatusColor(component.status)} className="text-xs">
                      {component.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {component.description}
                  </p>
                  <div className="text-xs text-muted-foreground mt-1">
                    Last check: {formatTimestamp(component.lastCheck)}
                  </div>
                </div>
              </div>
              
              {component.metrics && (
                <div className="text-right">
                  <div className="font-mono text-sm">
                    {component.metrics.value}{component.metrics.unit}
                  </div>
                  {component.metrics.threshold && (
                    <div className="text-xs text-muted-foreground">
                      Threshold: {component.metrics.threshold}{component.metrics.unit}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemStatus;