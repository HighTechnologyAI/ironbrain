import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Eye, 
  Users, 
  Lock,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Network,
  Server
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useDroneEcosystem } from '@/hooks/use-drone-ecosystem';

const SOCPanel: React.FC = () => {
  const { t } = useLanguage();
  const { drones, missions, loading } = useDroneEcosystem();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState({
    threat_level: 'low',
    active_incidents: 0,
    systems_monitored: 12,
    compliance_score: 94
  });

  // Mock security alerts for PHASE 2
  const mockAlerts = [
    {
      id: '1',
      type: 'unauthorized_access',
      severity: 'high',
      source: 'TIGER-001',
      description: 'Unexpected command received outside mission parameters',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: 'investigating'
    },
    {
      id: '2', 
      type: 'geo_fence_breach',
      severity: 'medium',
      source: 'TIGER-002',
      description: 'Drone approached restricted airspace boundary',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      status: 'resolved'
    },
    {
      id: '3',
      type: 'communication_anomaly',
      severity: 'low',
      source: 'Ground Station Alpha',
      description: 'Intermittent signal loss detected',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      status: 'monitoring'
    }
  ];

  useEffect(() => {
    setAlerts(mockAlerts);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-yellow-900';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'investigating': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'monitoring': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-500 bg-red-50 border-red-200';
      case 'high': return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span>Security Operations Center</span>
          </h1>
          <p className="text-muted-foreground">
            Real-time security monitoring and incident response for drone operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-primary">
            PHASE 2 - SOC
          </Badge>
          <Button size="sm" variant="outline">
            <Lock className="h-4 w-4 mr-2" />
            Security Settings
          </Button>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Threat Level</p>
                <p className={`text-2xl font-bold capitalize ${getThreatLevelColor(securityMetrics.threat_level).split(' ')[0]}`}>
                  {securityMetrics.threat_level}
                </p>
              </div>
              <div className={`p-3 rounded-full ${getThreatLevelColor(securityMetrics.threat_level)}`}>
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Incidents</p>
                <p className="text-2xl font-bold">{securityMetrics.active_incidents}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-50 text-orange-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Systems Monitored</p>
                <p className="text-2xl font-bold">{securityMetrics.systems_monitored}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                <Network className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Score</p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{securityMetrics.compliance_score}%</p>
                  <Progress value={securityMetrics.compliance_score} className="w-16" />
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-50 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Security Alerts</span>
            <Badge variant="destructive">{alerts.filter(a => a.status !== 'resolved').length} Active</Badge>
          </CardTitle>
          <CardDescription>
            Real-time security events and incident notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(alert.status)}
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium">{alert.type.replace('_', ' ').toUpperCase()}</h4>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Source: {alert.source} • {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {alert.status !== 'resolved' && (
                    <>
                      <Button size="sm" variant="outline">
                        Investigate
                      </Button>
                      <Button size="sm">
                        Resolve
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Health Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
            <CardDescription>
              Real-time monitoring of critical infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Server className="h-4 w-4" />
                  <span>Edge Functions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Database</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Operational</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Network className="h-4 w-4" />
                  <span>Communication Network</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Degraded</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Authentication Service</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Operational</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Access Control</span>
            </CardTitle>
            <CardDescription>
              User sessions and permissions monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active User Sessions</span>
                <Badge variant="outline">7</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Failed Login Attempts (24h)</span>
                <Badge variant="outline">2</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Privileged Operations</span>
                <Badge variant="outline">15</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Key Usage</span>
                <Badge variant="outline">234</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SOCPanel;