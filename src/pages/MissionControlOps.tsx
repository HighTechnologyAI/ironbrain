import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusChip } from '@/components/neon/StatusChip';
import { EmptyState } from '@/components/neon/EmptyState';
import { Map, Navigation, Radio, Gauge, Battery, Thermometer } from 'lucide-react';

const MissionControl: React.FC = () => {
  const { t } = useTranslation();

  // Feature flag check
  if (import.meta.env.VITE_FEATURE_MISSION_CONTROL !== 'true') {
    return null;
  }

  // Mock telemetry data
  const telemetryData = [
    { label: t('ops.telemetry.latitude'), value: '42.3601° N', icon: Navigation },
    { label: t('ops.telemetry.longitude'), value: '71.0589° W', icon: Navigation },
    { label: t('ops.telemetry.altitude'), value: '150 m', icon: Gauge },
    { label: t('ops.telemetry.speed'), value: '12.5 m/s', icon: Gauge },
    { label: t('ops.telemetry.batteryVoltage'), value: '14.8 V', icon: Battery },
    { label: t('ops.telemetry.escTemperature'), value: '65°C', icon: Thermometer },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('ops.missionControl.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('ops.missionControl.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flight Map */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              {t('ops.missionControl.map')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-surface-1 rounded-lg flex items-center justify-center">
              <EmptyState
                icon={<Map className="h-12 w-12" />}
                title="Map View"
                description="Mapbox integration will appear here when VITE_MAPBOX_TOKEN is configured"
              />
            </div>
          </CardContent>
        </Card>

        {/* Live Telemetry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              {t('ops.missionControl.telemetry')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {telemetryData.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm font-mono text-primary">{item.value}</span>
                </div>
              );
            })}
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('ops.status.status')}</span>
                <StatusChip status="flying" size="sm">
                  {t('ops.status.flying')}
                </StatusChip>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mission Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('ops.missionControl.waypoints')}</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<Navigation className="h-8 w-8" />}
              title="No Active Mission"
              description="Start a mission to see waypoints and flight path"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('ops.missionControl.flightPath')}</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={<Map className="h-8 w-8" />}
              title="Flight Path"
              description="Real-time flight path will be displayed here"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MissionControl;