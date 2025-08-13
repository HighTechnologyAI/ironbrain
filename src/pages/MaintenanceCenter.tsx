import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/ui/status-chip';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AppNavigation from '@/components/AppNavigation';
import { 
  Wrench, 
  Battery, 
  Thermometer, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  User,
  FileText,
  Zap,
  Settings
} from 'lucide-react';

interface MaintenanceTask {
  id: string;
  droneId: string;
  droneName: string;
  type: 'scheduled' | 'corrective' | 'predictive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  description: string;
  assignedTo: string;
  scheduledDate: string;
  estimatedDuration: string;
  completedAt?: string;
}

interface DroneHealth {
  id: string;
  name: string;
  model: string;
  flightHours: number;
  batteryHealth: number;
  motorTemp: number;
  lastMaintenance: string;
  nextMaintenance: string;
  healthScore: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

const MaintenanceCenter = () => {
  const [tasks] = useState<MaintenanceTask[]>([
    {
      id: '1',
      droneId: 'UAV-Alpha-01',
      droneName: 'Alpha-01',
      type: 'scheduled',
      priority: 'medium',
      status: 'pending',
      description: 'Замена пропеллеров и калибровка IMU',
      assignedTo: 'Николай Т.',
      scheduledDate: '2024-01-15',
      estimatedDuration: '2 часа'
    },
    {
      id: '2',
      droneId: 'UAV-Beta-03',
      droneName: 'Beta-03',
      type: 'corrective',
      priority: 'high',
      status: 'in_progress',
      description: 'Устранение вибрации в моторе #3',
      assignedTo: 'Сергей К.',
      scheduledDate: '2024-01-14',
      estimatedDuration: '4 часа'
    },
    {
      id: '3',
      droneId: 'UAV-Gamma-02',
      droneName: 'Gamma-02',
      type: 'predictive',
      priority: 'critical',
      status: 'overdue',
      description: 'Замена батареи (критически низкая ёмкость)',
      assignedTo: 'Андрей П.',
      scheduledDate: '2024-01-12',
      estimatedDuration: '1 час'
    }
  ]);

  const [droneFleet] = useState<DroneHealth[]>([
    {
      id: 'UAV-Alpha-01',
      name: 'Alpha-01',
      model: 'Tiger-X Pro',
      flightHours: 245,
      batteryHealth: 87,
      motorTemp: 42,
      lastMaintenance: '2024-01-01',
      nextMaintenance: '2024-01-15',
      healthScore: 92,
      status: 'excellent'
    },
    {
      id: 'UAV-Beta-03',
      name: 'Beta-03',
      model: 'Tiger-X Standard',
      flightHours: 189,
      batteryHealth: 74,
      motorTemp: 48,
      lastMaintenance: '2023-12-20',
      nextMaintenance: '2024-01-20',
      healthScore: 78,
      status: 'good'
    },
    {
      id: 'UAV-Gamma-02',
      name: 'Gamma-02',
      model: 'Tiger-X Pro',
      flightHours: 412,
      batteryHealth: 23,
      motorTemp: 55,
      lastMaintenance: '2023-12-10',
      nextMaintenance: '2024-01-12',
      healthScore: 34,
      status: 'critical'
    }
  ]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'ready';
      case 'in_progress': return 'armed';
      case 'pending': return 'info';
      case 'overdue': return 'critical';
      default: return 'info';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'critical': return 'critical';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'ready';
      default: return 'info';
    }
  };

  const getHealthStatusVariant = (status: string) => {
    switch (status) {
      case 'excellent': return 'ready';
      case 'good': return 'info';
      case 'warning': return 'warning';
      case 'critical': return 'critical';
      default: return 'info';
    }
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return 'ОТЛИЧНО';
      case 'good': return 'ХОРОШО';
      case 'warning': return 'ВНИМАНИЕ';
      case 'critical': return 'КРИТИЧНО';
      default: return status.toUpperCase();
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'scheduled': return 'Плановое';
      case 'corrective': return 'Корректирующее';
      case 'predictive': return 'Предиктивное';
      default: return type;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'ОЖИДАЕТ';
      case 'in_progress': return 'В РАБОТЕ';
      case 'completed': return 'ЗАВЕРШЕНО';
      case 'overdue': return 'ПРОСРОЧЕНО';
      default: return status.toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation title="Центр технического обслуживания" subtitle="Управление обслуживанием и здоровьем UAV флота" />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Maintenance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-surface-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                Всего задач
              </CardTitle>
              <Wrench className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{tasks.length}</div>
              <p className="text-xs text-muted-foreground">активных задач</p>
            </CardContent>
          </Card>

          <Card className="bg-surface-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                Просроченные
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-destructive">
                {tasks.filter(t => t.status === 'overdue').length}
              </div>
              <p className="text-xs text-muted-foreground">требуют внимания</p>
            </CardContent>
          </Card>

          <Card className="bg-surface-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                Средний балл здоровья
              </CardTitle>
              <Activity className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-success">
                {Math.round(droneFleet.reduce((acc, drone) => acc + drone.healthScore, 0) / droneFleet.length)}
              </div>
              <p className="text-xs text-muted-foreground">из 100 баллов</p>
            </CardContent>
          </Card>

          <Card className="bg-surface-1 border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-ui text-muted-foreground">
                Исправность флота
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono text-primary">
                {Math.round((droneFleet.filter(d => d.status !== 'critical').length / droneFleet.length) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">готов к полету</p>
            </CardContent>
          </Card>
        </div>

        {/* Maintenance Tasks */}
        <Card className="bg-surface-1 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-ui">
              <Settings className="h-5 w-5 text-primary" />
              Активные задачи обслуживания
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="border border-border rounded-lg p-4 bg-surface-2">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold font-ui">{task.droneName}</h3>
                      <Badge variant="outline" className="text-xs">
                        {getTypeText(task.type)}
                      </Badge>
                      <StatusChip 
                        priority={getPriorityVariant(task.priority) as any}
                        className="text-xs"
                      >
                        {task.priority.toUpperCase()}
                      </StatusChip>
                    </div>
                    <StatusChip variant={getStatusVariant(task.status) as any}>
                      {getStatusText(task.status)}
                    </StatusChip>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Исполнитель:</span>
                      <span className="font-semibold">{task.assignedTo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Дата:</span>
                      <span className="font-mono">{task.scheduledDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">Время:</span>
                      <span className="font-mono">{task.estimatedDuration}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Детали
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Drone Fleet Health */}
        <Card className="bg-surface-1 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-ui">
              <Activity className="h-5 w-5 text-primary" />
              Здоровье флота
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {droneFleet.map((drone) => (
                <Card key={drone.id} className="bg-surface-2 border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-ui text-lg">{drone.name}</CardTitle>
                        <CardDescription className="font-mono text-sm">{drone.model}</CardDescription>
                      </div>
                      <StatusChip variant={getHealthStatusVariant(drone.status) as any}>
                        {getHealthStatusText(drone.status)}
                      </StatusChip>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Health Score */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Общее состояние:</span>
                        <span className="font-mono font-semibold">{drone.healthScore}/100</span>
                      </div>
                      <Progress value={drone.healthScore} className="h-2" />
                    </div>

                    {/* Metrics */}
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">Налет:</span>
                        </div>
                        <span className="font-mono font-semibold">{drone.flightHours}ч</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Battery className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">Батарея:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">{drone.batteryHealth}%</span>
                          <StatusChip 
                            variant={drone.batteryHealth > 80 ? 'ready' : drone.batteryHealth > 50 ? 'warning' : 'critical'}
                            className="text-xs"
                          >
                            {drone.batteryHealth > 80 ? 'ОК' : drone.batteryHealth > 50 ? 'ЗАМЕНА' : 'СРОЧНО'}
                          </StatusChip>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">Температура:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">{drone.motorTemp}°C</span>
                          <StatusChip 
                            variant={drone.motorTemp < 45 ? 'ready' : drone.motorTemp < 50 ? 'warning' : 'critical'}
                            className="text-xs"
                          >
                            {drone.motorTemp < 45 ? 'НОРМА' : drone.motorTemp < 50 ? 'ВЫСОКАЯ' : 'КРИТИЧНО'}
                          </StatusChip>
                        </div>
                      </div>
                    </div>

                    {/* Maintenance Dates */}
                    <div className="pt-3 border-t border-border text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Последнее ТО:</span>
                        <span className="font-mono">{drone.lastMaintenance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Следующее ТО:</span>
                        <span className="font-mono font-semibold text-primary">{drone.nextMaintenance}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceCenter;