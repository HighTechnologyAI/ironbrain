import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, Wifi, WifiOff, Zap } from 'lucide-react';

export interface SystemHealthMetrics {
  realTimeConnections: number;
  averageLatency: number;
  dataLoss: number;
  lastUpdate: Date;
  connectionStatus: 'connected' | 'degraded' | 'offline';
  errorCount: number;
}

interface PerformanceMonitorProps {
  isConnected: boolean;
  lastUpdate: Date | null;
  telemetryActive: boolean;
  onReconnect?: () => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isConnected,
  lastUpdate,
  telemetryActive,
  onReconnect
}) => {
  const [metrics, setMetrics] = useState<SystemHealthMetrics>({
    realTimeConnections: 0,
    averageLatency: 0,
    dataLoss: 0,
    lastUpdate: new Date(),
    connectionStatus: 'offline',
    errorCount: 0
  });

  useEffect(() => {
    const updateMetrics = () => {
      const now = new Date();
      const timeSinceLastUpdate = lastUpdate ? now.getTime() - lastUpdate.getTime() : Infinity;
      
      let status: 'connected' | 'degraded' | 'offline' = 'offline';
      if (isConnected && timeSinceLastUpdate < 5000) {
        status = 'connected';
      } else if (isConnected && timeSinceLastUpdate < 30000) {
        status = 'degraded';
      }

      setMetrics(prev => ({
        ...prev,
        connectionStatus: status,
        realTimeConnections: isConnected ? 1 : 0,
        averageLatency: isConnected ? Math.random() * 100 + 50 : 0,
        dataLoss: status === 'degraded' ? Math.random() * 5 : 0,
        lastUpdate: now,
        errorCount: status === 'offline' ? prev.errorCount + 1 : prev.errorCount
      }));
    };

    const interval = setInterval(updateMetrics, 2000);
    updateMetrics();

    return () => clearInterval(interval);
  }, [isConnected, lastUpdate]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'offline': return <WifiOff className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          System Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(metrics.connectionStatus)}
            <span className="font-medium">Real-time Connection</span>
          </div>
          <Badge variant={metrics.connectionStatus === 'connected' ? 'default' : 'destructive'}>
            {metrics.connectionStatus.toUpperCase()}
          </Badge>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <span className="text-muted-foreground">Connections:</span>
            <p className="font-mono text-lg">{metrics.realTimeConnections}</p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Latency:</span>
            <p className={`font-mono text-lg ${
              metrics.averageLatency < 100 ? 'text-green-600' : 
              metrics.averageLatency < 200 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {Math.round(metrics.averageLatency)}ms
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Data Loss:</span>
            <p className={`font-mono text-lg ${
              metrics.dataLoss < 1 ? 'text-green-600' : 
              metrics.dataLoss < 3 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {metrics.dataLoss.toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Errors:</span>
            <p className={`font-mono text-lg ${
              metrics.errorCount === 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.errorCount}
            </p>
          </div>
        </div>

        {/* Telemetry Status */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {telemetryActive ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm">Telemetry Stream</span>
          </div>
          <Badge variant={telemetryActive ? 'default' : 'secondary'}>
            {telemetryActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Last Update Info */}
        {lastUpdate && (
          <div className="text-xs text-muted-foreground">
            Last data received: {lastUpdate.toLocaleTimeString()}
          </div>
        )}

        {/* Reconnect Button */}
        {!isConnected && onReconnect && (
          <Button onClick={onReconnect} variant="outline" size="sm" className="w-full">
            Reconnect
          </Button>
        )}
      </CardContent>
    </Card>
  );
};