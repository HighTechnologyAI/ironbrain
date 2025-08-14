import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/neon/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Plane, 
  Database, 
  Activity, 
  Battery, 
  MapPin,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

interface UAVSummary {
  total_drones: number;
  online_drones: number;
  offline_drones: number;
  avg_battery_level: number;
  active_days_this_month: number;
}

interface RecentTelemetry {
  drone_name: string;
  model: string;
  battery_level: number;
  status: string;
  latest_data: {
    latest_altitude: number;
    latest_speed: number;
    latest_battery_voltage: number;
    latest_temperature: number;
    data_points_last_hour: number;
  };
}

interface UAVDataConnectorProps {
  onDataSelect: (data: any, type: 'fleet_summary' | 'telemetry_analysis' | 'drone_performance') => void;
}

export const UAVDataConnector: React.FC<UAVDataConnectorProps> = ({ onDataSelect }) => {
  const { data: uavSummary, isLoading: summaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['uav-analytics-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uav_analytics_summary')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as UAVSummary;
    }
  });

  const { data: recentTelemetry, isLoading: telemetryLoading, refetch: refetchTelemetry } = useQuery({
    queryKey: ['recent-telemetry-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recent_telemetry_summary')
        .select('*')
        .limit(10);
      
      if (error) throw error;
      return data as RecentTelemetry[];
    }
  });

  const handleFleetAnalysis = () => {
    if (!uavSummary) {
      toast.error('No fleet data available');
      return;
    }

    const fleetData = {
      fleet_summary: uavSummary,
      analysis_request: 'Analyze overall fleet performance and provide optimization recommendations',
      timestamp: new Date().toISOString()
    };

    onDataSelect(fleetData, 'fleet_summary');
    toast.success('Fleet data loaded for AI analysis');
  };

  const handleTelemetryAnalysis = () => {
    if (!recentTelemetry || recentTelemetry.length === 0) {
      toast.error('No recent telemetry data available');
      return;
    }

    const telemetryData = {
      recent_telemetry: recentTelemetry,
      analysis_request: 'Analyze recent telemetry data for patterns, anomalies, and maintenance predictions',
      data_collection_period: 'last_hour',
      timestamp: new Date().toISOString()
    };

    onDataSelect(telemetryData, 'telemetry_analysis');
    toast.success('Telemetry data loaded for AI analysis');
  };

  const handleDronePerformance = () => {
    if (!recentTelemetry || recentTelemetry.length === 0) {
      toast.error('No drone performance data available');
      return;
    }

    const performanceData = {
      drone_metrics: recentTelemetry.map(drone => ({
        name: drone.drone_name,
        model: drone.model,
        battery_level: drone.battery_level,
        status: drone.status,
        performance_metrics: drone.latest_data
      })),
      analysis_request: 'Evaluate individual drone performance and identify underperforming units',
      timestamp: new Date().toISOString()
    };

    onDataSelect(performanceData, 'drone_performance');
    toast.success('Drone performance data loaded for AI analysis');
  };

  const handleRefresh = () => {
    refetchSummary();
    refetchTelemetry();
    toast.success('UAV data refreshed');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              UAV Data Connector
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fleet Summary */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Fleet Summary
            </h4>
            
            {summaryLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted/20 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : uavSummary ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/20 rounded-lg">
                  <div className="text-2xl font-bold">{uavSummary.total_drones}</div>
                  <div className="text-sm text-muted-foreground">Total Drones</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{uavSummary.online_drones}</div>
                  <div className="text-sm text-green-600">Online</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold text-red-700">{uavSummary.offline_drones}</div>
                  <div className="text-sm text-red-600">Offline</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-700">
                    {uavSummary.avg_battery_level ? Math.round(uavSummary.avg_battery_level) : 0}%
                  </div>
                  <div className="text-sm text-blue-600">Avg Battery</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No fleet data available
              </div>
            )}

            <Button 
              onClick={handleFleetAnalysis}
              disabled={!uavSummary}
              className="w-full"
              variant="neon"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analyze Fleet Performance
            </Button>
          </div>

          {/* Recent Telemetry */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Telemetry Data
            </h4>
            
            {telemetryLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted/20 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentTelemetry && recentTelemetry.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {recentTelemetry.map((drone, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{drone.drone_name}</div>
                        <Badge variant="outline">{drone.model}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={drone.status === 'online' ? 'default' : 'secondary'}
                          className={drone.status === 'online' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {drone.status}
                        </Badge>
                        {drone.battery_level && (
                          <div className="flex items-center gap-1 text-sm">
                            <Battery className="h-3 w-3" />
                            {Math.round(drone.battery_level)}%
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {drone.latest_data && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                        <div>Alt: {drone.latest_data.latest_altitude || 'N/A'}m</div>
                        <div>Speed: {drone.latest_data.latest_speed || 'N/A'}m/s</div>
                        <div>Temp: {drone.latest_data.latest_temperature || 'N/A'}°C</div>
                        <div>Data: {drone.latest_data.data_points_last_hour || 0} pts/hr</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No recent telemetry data available
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button 
                onClick={handleTelemetryAnalysis}
                disabled={!recentTelemetry || recentTelemetry.length === 0}
                variant="outline"
              >
                <Activity className="h-4 w-4 mr-2" />
                Analyze Telemetry
              </Button>
              <Button 
                onClick={handleDronePerformance}
                disabled={!recentTelemetry || recentTelemetry.length === 0}
                variant="outline"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Drone Performance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};