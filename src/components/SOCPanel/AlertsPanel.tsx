import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  X, 
  Filter,
  Clock,
  Shield
} from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'security' | 'system' | 'network' | 'drone' | 'mission';
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
  source: string;
}

interface AlertsPanelProps {
  alerts?: Alert[];
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
}

const mockAlerts: Alert[] = [
  {
    id: 'alert_1',
    title: 'Unauthorized Access Attempt',
    description: 'Multiple failed login attempts detected from IP 192.168.1.100',
    severity: 'critical',
    category: 'security',
    timestamp: '2025-01-17T10:30:00Z',
    status: 'active',
    source: 'Auth System'
  },
  {
    id: 'alert_2', 
    title: 'Low Battery Warning',
    description: 'Tiger-02 battery level below 20% - Return to base recommended',
    severity: 'high',
    category: 'drone',
    timestamp: '2025-01-17T10:25:00Z',
    status: 'acknowledged',
    source: 'Tiger-02'
  },
  {
    id: 'alert_3',
    title: 'Network Latency High',
    description: 'Telemetry connection experiencing delays >500ms',
    severity: 'medium',
    category: 'network',
    timestamp: '2025-01-17T10:20:00Z',
    status: 'active',
    source: 'Network Monitor'
  },
  {
    id: 'alert_4',
    title: 'Mission Completed',
    description: 'Patrol Mission #1234 completed successfully',
    severity: 'info',
    category: 'mission',
    timestamp: '2025-01-17T10:15:00Z',
    status: 'resolved',
    source: 'Mission Control'
  }
];

export const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts = mockAlerts,
  onAcknowledge,
  onResolve,
  onDismiss
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <AlertCircle className="h-4 w-4" />;
      case 'low': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'destructive';
      case 'acknowledged': return 'default';
      case 'resolved': return 'default';
      default: return 'secondary';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && alert.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    return true;
  });

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Alerts
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {filteredAlerts.length} alerts
          </Badge>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="network">Network</SelectItem>
              <SelectItem value="drone">Drone</SelectItem>
              <SelectItem value="mission">Mission</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No alerts match the current filters
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`mt-1 ${getSeverityColor(alert.severity) === 'destructive' ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {getSeverityIcon(alert.severity)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(alert.timestamp)}
                          </span>
                          <span>Source: {alert.source}</span>
                          <Badge variant={getStatusColor(alert.status)} className="text-xs">
                            {alert.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismiss?.(alert.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Action Buttons */}
                  {alert.status === 'active' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAcknowledge?.(alert.id)}
                      >
                        Acknowledge
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onResolve?.(alert.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Resolve
                      </Button>
                    </div>
                  )}
                  
                  {alert.status === 'acknowledged' && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onResolve?.(alert.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Resolve
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AlertsPanel;