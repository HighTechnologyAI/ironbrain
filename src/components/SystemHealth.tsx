import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusChip } from '@/components/neon/StatusChip';
import { Activity, AlertTriangle, CheckCircle, Clock, Wifi, Database, Cpu } from 'lucide-react';

interface SystemHealthProps {
  className?: string;
}

interface SystemMetric {
  name: string;
  status: 'online' | 'warning' | 'error' | 'ok';
  value: string;
  lastUpdate: string;
  icon: React.ComponentType<any>;
}

const SystemHealth: React.FC<SystemHealthProps> = ({ className = "" }) => {
  // Mock system metrics - in real app, this would come from monitoring APIs
  const systemMetrics: SystemMetric[] = [
    {
      name: 'Database',
      status: 'online',
      value: '2ms',
      lastUpdate: '1 min ago',
      icon: Database
    },
    {
      name: 'CPU Usage',
      status: 'ok',
      value: '45%',
      lastUpdate: '30s ago',
      icon: Cpu
    },
    {
      name: 'Network',
      status: 'online',
      value: '12ms',
      lastUpdate: '15s ago',
      icon: Wifi
    },
    {
      name: 'UAV Systems',
      status: 'warning',
      value: '2/3 online',
      lastUpdate: '2 min ago',
      icon: Activity
    },
    {
      name: 'Telemetry',
      status: 'online',
      value: 'Active',
      lastUpdate: 'Live',
      icon: CheckCircle
    },
    {
      name: 'Alerts',
      status: 'warning',
      value: '3 pending',
      lastUpdate: '5 min ago',
      icon: AlertTriangle
    }
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {systemMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">{metric.name}</span>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {metric.lastUpdate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono mb-1">{metric.value}</div>
                  <StatusChip status={metric.status} size="sm">
                    {metric.status === 'online' ? 'Online' :
                     metric.status === 'ok' ? 'OK' :
                     metric.status === 'warning' ? 'Warning' : 'Error'}
                  </StatusChip>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall System Status</span>
            <StatusChip status="ok" size="sm">
              Operational
            </StatusChip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealth;