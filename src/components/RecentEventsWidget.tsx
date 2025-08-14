import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusChip } from '@/components/neon/StatusChip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { 
  Activity, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle,
  Clock
} from 'lucide-react';

const getSeverityIcon = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
    case 'error':
      return <XCircle className="h-4 w-4" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'info':
      return <Info className="h-4 w-4" />;
    default:
      return <CheckCircle className="h-4 w-4" />;
  }
};

const getSeverityVariant = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    default:
      return 'info';
  }
};

export const RecentEventsWidget: React.FC = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ['recent-uav-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('uav_events')
        .select('*')
        .order('ts', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {!events || events.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent events</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-shrink-0 pt-1">
                    <StatusChip status={getSeverityVariant(event.severity)} size="sm">
                      {event.severity}
                    </StatusChip>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      {getSeverityIcon(event.severity)}
                      <span className="font-medium">
                        {event.event_type}
                      </span>
                      {event.drone_id && (
                        <span className="text-xs font-mono bg-muted/20 px-2 py-1 rounded">
                          {event.drone_id}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {event.message || 'No message available'}
                    </p>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(new Date(event.ts), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};