import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SystemStatus } from '@/services/adminService';
import { RefreshCw, Activity, Database, Server, Shield } from 'lucide-react';

interface SystemStatusCardProps {
  systemStatus: SystemStatus | null;
  loading: boolean;
  onRefresh: () => void;
}

export const SystemStatusCard: React.FC<SystemStatusCardProps> = ({
  systemStatus,
  loading,
  onRefresh
}) => {
  const getStatusBadge = (status: boolean) => (
    <Badge variant={status ? 'default' : 'destructive'}>
      {status ? 'Online' : 'Offline'}
    </Badge>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          System Status
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {systemStatus ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Database</span>
              </div>
              {getStatusBadge(systemStatus.database)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                <span>API</span>
              </div>
              {getStatusBadge(systemStatus.api)}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Authentication</span>
              </div>
              {getStatusBadge(systemStatus.auth)}
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date(systemStatus.timestamp).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            {loading ? 'Loading status...' : 'Click refresh to load status'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};