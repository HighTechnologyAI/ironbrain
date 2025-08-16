import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Wrench, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  Battery,
  Thermometer,
  Gauge,
  Clock,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useDroneEcosystem } from '@/hooks/use-drone-ecosystem';

interface MaintenanceAlert {
  id: string;
  drone_id: string;
  component: string;
  type: 'scheduled' | 'predictive' | 'emergency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  predicted_failure_date?: string;
  maintenance_due_date: string;
  confidence: number;
}

interface DroneHealth {
  drone_id: string;
  health_score: number;
  battery_cycles: number;
  flight_hours: number;
  components: {
    propellers: number;
    motors: number;
    camera: number;
    gps: number;
    communication: number;
  };
  predictions: {
    battery_replacement: number; // days
    motor_servicing: number;
    calibration_needed: number;
  };
}

const PredictiveMaintenance: React.FC = () => {
  const { t } = useLanguage();
  const { drones, telemetry, loading } = useDroneEcosystem();
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  const [droneHealth, setDroneHealth] = useState<DroneHealth[]>([]);

  // Mock predictive maintenance data for PHASE 2
  useEffect(() => {
    const mockAlerts: MaintenanceAlert[] = [
      {
        id: '1',
        drone_id: 'tiger-001',
        component: 'Battery Pack',
        type: 'predictive',
        severity: 'high',
        description: 'Battery capacity degradation detected. Replacement recommended within 7 days.',
        predicted_failure_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        maintenance_due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 87
      },
      {
        id: '2',
        drone_id: 'tiger-002',
        component: 'Propeller #3',
        type: 'scheduled',
        severity: 'medium',
        description: 'Scheduled propeller inspection and balancing required.',
        maintenance_due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 100
      },
      {
        id: '3',
        drone_id: 'tiger-003',
        component: 'GPS Module',
        type: 'predictive',
        severity: 'medium',
        description: 'GPS accuracy degradation trend detected. Calibration recommended.',
        predicted_failure_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        maintenance_due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        confidence: 72
      }
    ];

    const mockHealth: DroneHealth[] = [
      {
        drone_id: 'tiger-001',
        health_score: 73,
        battery_cycles: 287,
        flight_hours: 156.7,
        components: {
          propellers: 85,
          motors: 78,
          camera: 92,
          gps: 89,
          communication: 95
        },
        predictions: {
          battery_replacement: 7,
          motor_servicing: 45,
          calibration_needed: 30
        }
      },
      {
        drone_id: 'tiger-002',
        health_score: 91,
        battery_cycles: 145,
        flight_hours: 89.3,
        components: {
          propellers: 88,
          motors: 94,
          camera: 91,
          gps: 96,
          communication: 89
        },
        predictions: {
          battery_replacement: 45,
          motor_servicing: 120,
          calibration_needed: 60
        }
      },
      {
        drone_id: 'tiger-003',
        health_score: 84,
        battery_cycles: 198,
        flight_hours: 112.4,
        components: {
          propellers: 90,
          motors: 88,
          camera: 85,
          gps: 76,
          communication: 92
        },
        predictions: {
          battery_replacement: 25,
          motor_servicing: 75,
          calibration_needed: 15
        }
      }
    ];

    setMaintenanceAlerts(mockAlerts);
    setDroneHealth(mockHealth);
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

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getComponentIcon = (component: string) => {
    switch (component.toLowerCase()) {
      case 'battery pack': return <Battery className="h-4 w-4" />;
      case 'gps module': return <Gauge className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const formatDaysFromNow = (dateString: string) => {
    const days = Math.ceil((new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days` : 'Overdue';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center space-x-2">
            <Wrench className="h-8 w-8 text-primary" />
            <span>Predictive Maintenance</span>
          </h1>
          <p className="text-muted-foreground">
            AI-powered maintenance scheduling and health monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-primary">
            PHASE 2 - AI MVP
          </Badge>
          <Button size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Maintenance
          </Button>
        </div>
      </div>

      {/* Maintenance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{maintenanceAlerts.length}</p>
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
                <p className="text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold">
                  {maintenanceAlerts.filter(a => a.severity === 'critical').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-50 text-red-600">
                <XCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Health Score</p>
                <p className="text-2xl font-bold">
                  {Math.round(droneHealth.reduce((sum, d) => sum + d.health_score, 0) / droneHealth.length)}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-50 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Tasks</p>
                <p className="text-2xl font-bold">
                  {maintenanceAlerts.filter(a => a.type === 'scheduled').length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-50 text-blue-600">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <span>Maintenance Alerts</span>
            <Badge variant="destructive">{maintenanceAlerts.filter(a => a.severity === 'high' || a.severity === 'critical').length} Urgent</Badge>
          </CardTitle>
          <CardDescription>
            Predictive and scheduled maintenance notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getComponentIcon(alert.component)}
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    {alert.type === 'predictive' && (
                      <Badge variant="outline">
                        AI: {alert.confidence}%
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{alert.component} - {alert.drone_id.toUpperCase()}</h4>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {formatDaysFromNow(alert.maintenance_due_date)}
                      {alert.predicted_failure_date && ` • Predicted failure: ${formatDaysFromNow(alert.predicted_failure_date)}`}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    Schedule
                  </Button>
                  <Button size="sm">
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Drone Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Drone Health Status</span>
          </CardTitle>
          <CardDescription>
            Component-level health analysis and predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {droneHealth.map((health) => (
              <div key={health.drone_id} className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{health.drone_id.toUpperCase()}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{health.flight_hours}h flight time</span>
                      <span>{health.battery_cycles} battery cycles</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Overall Health</p>
                    <p className={`text-2xl font-bold ${getHealthColor(health.health_score)}`}>
                      {health.health_score}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                  {Object.entries(health.components).map(([component, score]) => (
                    <div key={component} className="text-center">
                      <p className="text-sm text-muted-foreground capitalize">{component}</p>
                      <p className={`font-semibold ${getHealthColor(score)}`}>{score}%</p>
                      <Progress value={score} className="w-full h-2 mt-1" />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Battery className="h-4 w-4" />
                      <span>Battery replacement</span>
                    </div>
                    <span className="font-medium">{health.predictions.battery_replacement} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Motor servicing</span>
                    </div>
                    <span className="font-medium">{health.predictions.motor_servicing} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Gauge className="h-4 w-4" />
                      <span>Calibration needed</span>
                    </div>
                    <span className="font-medium">{health.predictions.calibration_needed} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveMaintenance;