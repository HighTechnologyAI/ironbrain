import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusChip } from '@/components/neon/StatusChip';
import { EmptyState } from '@/components/neon/EmptyState';
import { Activity, AlertTriangle, Zap, Users, Database, Cpu, Wifi, Battery } from 'lucide-react';
import { cn } from '@/lib/utils';

const OpsCenter: React.FC = () => {
  const { t } = useTranslation();

  // Feature flag check
  if (import.meta.env.VITE_FEATURE_OPS_CENTER !== 'true') {
    return null;
  }

  // Mock data - in real implementation, this would come from APIs
  const kpis = [
    {
      title: t('common.tasks'),
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: Activity,
      status: 'ok' as const
    },
    {
      title: t('ops.alerts'),
      value: '3',
      change: '-2',
      trend: 'down',
      icon: AlertTriangle,
      status: 'warning' as const
    },
    {
      title: t('ops.opsCenter.systemStatus'),
      value: 'Online',
      change: '99.9%',
      trend: 'stable',
      icon: Zap,
      status: 'online' as const
    },
    {
      title: t('common.team'),
      value: '8',
      change: '+2',
      trend: 'up',
      icon: Users,
      status: 'info' as const
    }
  ];

  const systemMetrics = [
    { name: t('common.database'), status: 'online' as const, value: '2ms', icon: Database },
    { name: 'CPU', status: 'ok' as const, value: '45%', icon: Cpu },
    { name: t('common.network'), status: 'online' as const, value: '12ms', icon: Wifi },
    { name: t('ops.telemetry.batteryVoltage'), status: 'warning' as const, value: '85%', icon: Battery },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('ops.opsCenter.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('ops.opsCenter.subtitle')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <Card key={index} className="transition-all hover:shadow-medium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {kpi.change} from last period
                    </p>
                  </div>
                  <StatusChip status={kpi.status} size="sm">
                    {t(`ops.status.${kpi.status}`)}
                  </StatusChip>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t('ops.opsCenter.systemStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{metric.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{metric.value}</span>
                    <StatusChip status={metric.status} size="sm">
                      {t(`ops.status.${metric.status}`)}
                    </StatusChip>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {t('ops.opsCenter.alerts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<AlertTriangle className="h-8 w-8" />}
              title={t('common.noData')}
              description="No recent alerts to display"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OpsCenter;