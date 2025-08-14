import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusChip } from '@/components/neon/StatusChip';
import { 
  Plane, 
  Battery, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

export const UAVMetricsWidget: React.FC = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['uav-metrics'],
    queryFn: async () => {
      const [dronesResult, eventsResult, telemetryResult] = await Promise.all([
        supabase.from('uav_drones').select('status, battery_level'),
        supabase.from('uav_events').select('severity').gte('ts', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('uav_telemetry').select('id').gte('ts', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      ]);

      const drones = dronesResult.data || [];
      const events = eventsResult.data || [];
      const recentTelemetry = telemetryResult.data || [];

      const totalDrones = drones.length;
      const onlineDrones = drones.filter(d => d.status === 'online').length;
      const lowBatteryDrones = drones.filter(d => d.battery_level && d.battery_level < 20).length;
      const criticalEvents = events.filter(e => e.severity === 'critical').length;
      const warningEvents = events.filter(e => e.severity === 'warning').length;
      const avgBattery = drones.length > 0 
        ? Math.round(drones.reduce((sum, d) => sum + (d.battery_level || 0), 0) / drones.length)
        : 0;

      return {
        totalDrones,
        onlineDrones,
        lowBatteryDrones,
        criticalEvents,
        warningEvents,
        avgBattery,
        telemetryUpdates: recentTelemetry.length
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  type StatusType = "critical" | "pending" | "info" | "online" | "warning" | "offline" | "ok" | "error" | "armed" | "ready" | "flying";

  const metricCards: Array<{
    title: string;
    value: string;
    subtitle: string;
    icon: any;
    status: StatusType;
    trend: string;
  }> = [
    {
      title: 'Fleet Status',
      value: `${metrics?.onlineDrones || 0}/${metrics?.totalDrones || 0}`,
      subtitle: 'Online',
      icon: Plane,
      status: (metrics?.onlineDrones || 0) > 0 ? 'online' : 'offline',
      trend: '+2 from yesterday'
    },
    {
      title: 'Avg Battery',
      value: `${metrics?.avgBattery || 0}%`,
      subtitle: `${metrics?.lowBatteryDrones || 0} low`,
      icon: Battery,
      status: (metrics?.avgBattery || 0) > 50 ? 'ok' : 'warning',
      trend: '-5% from yesterday'
    },
    {
      title: 'Events (24h)',
      value: `${(metrics?.criticalEvents || 0) + (metrics?.warningEvents || 0)}`,
      subtitle: `${metrics?.criticalEvents || 0} critical`,
      icon: AlertTriangle,
      status: (metrics?.criticalEvents || 0) > 0 ? 'error' : 'ok',
      trend: '+3 from yesterday'
    },
    {
      title: 'Telemetry',
      value: `${metrics?.telemetryUpdates || 0}`,
      subtitle: 'Last hour',
      icon: Activity,
      status: (metrics?.telemetryUpdates || 0) > 0 ? 'online' : 'offline',
      trend: '+12% from last hour'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricCards.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <Card key={index} className="transition-all hover:shadow-medium">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <IconComponent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <StatusChip status={metric.status} size="sm">
                    {metric.status === 'ok' ? 'OK' : 
                     metric.status === 'online' ? 'Online' :
                     metric.status === 'offline' ? 'Offline' :
                     metric.status === 'warning' ? 'Warning' :
                     metric.status === 'error' ? 'Error' : 'Unknown'}
                  </StatusChip>
                </div>
                <p className="text-xs text-muted-foreground">
                  {metric.subtitle}
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {metric.trend}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};