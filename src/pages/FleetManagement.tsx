import React from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusChip } from '@/components/neon/StatusChip';
import { EmptyState } from '@/components/neon/EmptyState';
import { Plane, Battery, MapPin, Clock, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ConfigService } from '@/services/configService';

const Fleet: React.FC = () => {
  const { t } = useTranslation();

  // Feature flag check
  if (!ConfigService.isFeatureEnabled('fleet')) {
    return null;
  }

  const { data: drones, isLoading } = useQuery({
    queryKey: ['uav-drones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uav_drones')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'online': return 'online';
      case 'offline': return 'offline';
      case 'armed': return 'armed';
      case 'flying': return 'ready';
      default: return 'info';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {t('ops.fleet.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('ops.fleet.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('ops.fleet.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('ops.fleet.subtitle')}
        </p>
      </div>

      {/* Drone Grid */}
      {!drones || drones.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={<Plane className="h-12 w-12" />}
              title={t('common.noData')}
              description="No drones registered in the fleet"
              action={{
                label: `${t('common.create')} ${t('ops.fleet.drone')}`,
                onClick: () => console.log('Create drone')
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drones.map((drone) => (
            <Card key={drone.id} className="transition-all hover:shadow-medium">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    {drone.name || `Drone ${drone.serial}`}
                  </CardTitle>
                  <StatusChip status={getStatusVariant(drone.status)} size="sm">
                    {drone.status || t('ops.status.offline')}
                  </StatusChip>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">{t('ops.fleet.serial')}</div>
                    <div className="font-mono">{drone.serial || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{t('ops.fleet.model')}</div>
                    <div>{drone.model || 'Unknown'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted-foreground">{t('ops.fleet.firmware')}</div>
                    <div className="font-mono">{drone.firmware || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{t('ops.fleet.batteryLevel')}</div>
                    <div className="flex items-center gap-1">
                      <Battery className="h-3 w-3" />
                      {drone.battery_level ? `${Math.round(drone.battery_level)}%` : 'N/A'}
                    </div>
                  </div>
                </div>

                {drone.last_contact && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {t('ops.fleet.lastContact')}
                    </div>
                    <div className="font-medium">
                      {formatDistanceToNow(new Date(drone.last_contact), { addSuffix: true })}
                    </div>
                  </div>
                )}

                {(drone.location_lat && drone.location_lon) && (
                  <div className="flex items-center justify-between text-sm pt-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {t('ops.fleet.location')}
                    </div>
                    <div className="font-mono text-xs">
                      {drone.location_lat.toFixed(4)}, {drone.location_lon.toFixed(4)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Fleet;