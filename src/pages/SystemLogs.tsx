import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusChip } from '@/components/neon/StatusChip';
import { EmptyState } from '@/components/neon/EmptyState';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Search, Filter, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const SystemLogs: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  // Feature flag check
  if (import.meta.env.VITE_FEATURE_LOGS !== 'true') {
    return null;
  }

  const { data: events, isLoading } = useQuery({
    queryKey: ['uav-events', searchQuery, severityFilter],
    queryFn: async () => {
      let query = supabase
        .from('uav_events')
        .select('*')
        .order('ts', { ascending: false })
        .limit(100);

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      if (searchQuery.trim()) {
        query = query.ilike('message', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getSeverityVariant = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'critical';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {t('logs.title', 'System Logs')}
          </h1>
          <p className="text-muted-foreground">
            {t('logs.subtitle', 'Audit trail and events')}
          </p>
        </div>
        <Card>
          <CardContent className="p-6">
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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('logs.title', 'System Logs')}
        </h1>
        <p className="text-muted-foreground">
          {t('logs.subtitle', 'Audit trail and events')}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('logs.filter', 'Filter')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('logs.search', 'Search logs...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('logs.severity', 'Severity')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Event Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!events || events.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-8 w-8" />}
              title="No Events Found"
              description={
                searchQuery || severityFilter !== 'all'
                  ? "No events match your current filters"
                  : "No events have been logged yet"
              }
            />
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-shrink-0 pt-1">
                    <StatusChip status={getSeverityVariant(event.severity)} size="sm">
                      {event.severity}
                    </StatusChip>
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(new Date(event.ts), { addSuffix: true })}
                      </span>
                      {event.event_type && (
                        <span className="text-xs font-mono bg-muted/20 px-2 py-1 rounded">
                          {event.event_type}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-foreground leading-relaxed">
                      {event.message || 'No message available'}
                    </p>
                    
                    {event.data && Object.keys(event.data).length > 0 && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          Event Data
                        </summary>
                        <pre className="mt-2 p-2 bg-muted/20 rounded text-xs overflow-x-auto">
                          {JSON.stringify(event.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemLogs;