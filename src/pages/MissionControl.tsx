import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/ui/status-chip';
import { Badge } from '@/components/ui/badge';
import AppNavigation from '@/components/AppNavigation';
import { UAVHeader } from '@/components/UAVHeader';
import { 
  Plane, 
  MapPin, 
  Clock, 
  Battery, 
  Wind, 
  Thermometer,
  Activity,
  AlertTriangle,
  CheckCircle,
  Radio,
  Satellite,
  Target
} from 'lucide-react';

interface Mission {
  id: string;
  name: string;
  status: 'planning' | 'armed' | 'in_flight' | 'completed' | 'aborted';
  drone: string;
  waypoints: number;
  altitude: string;
  duration: string;
  progress: number;
}

interface DroneStatus {
  id: string;
  name: string;
  status: 'ready' | 'armed' | 'warning' | 'critical';
  battery: number;
  temperature: number;
  rssi: number;
  lastSeen: string;
}

const MissionControl = () => {
  const [activeMissions] = useState<Mission[]>([
    {
      id: 'M001',
      name: 'Патрулирование периметра А',
      status: 'in_flight',
      drone: 'UAV-Alpha-01',
      waypoints: 12,
      altitude: '150м',
      duration: '23:45',
      progress: 65
    },
    {
      id: 'M002', 
      name: 'Инспекция объекта В-12',
      status: 'armed',
      drone: 'UAV-Beta-03',
      waypoints: 8,
      altitude: '80м',
      duration: '00:00',
      progress: 0
    }
  ]);

  const [droneFleet] = useState<DroneStatus[]>([
    {
      id: 'UAV-Alpha-01',
      name: 'Alpha-01',
      status: 'armed',
      battery: 87,
      temperature: 42,
      rssi: -45,
      lastSeen: '2s ago'
    },
    {
      id: 'UAV-Beta-03',
      name: 'Beta-03', 
      status: 'ready',
      battery: 92,
      temperature: 38,
      rssi: -38,
      lastSeen: '1s ago'
    },
    {
      id: 'UAV-Gamma-02',
      name: 'Gamma-02',
      status: 'warning',
      battery: 23,
      temperature: 48,
      rssi: -52,
      lastSeen: '15s ago'
    }
  ]);

  const navigate = useNavigate();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ready': return 'ready';
      case 'armed': return 'armed';
      case 'in_flight': return 'armed';
      case 'warning': return 'warning';
      case 'critical': return 'critical';
      default: return 'info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'ГОТОВ';
      case 'armed': return 'ВООРУЖЕН';
      case 'in_flight': return 'В ПОЛЕТЕ';
      case 'planning': return 'ПЛАНИРОВАНИЕ';
      case 'completed': return 'ЗАВЕРШЕН';
      case 'aborted': return 'ПРЕРВАН';
      case 'warning': return 'ПРЕДУПРЕЖДЕНИЕ';
      case 'critical': return 'КРИТИЧНО';
      default: return status.toUpperCase();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation title="Mission Control" subtitle="Центр управления UAV миссиями" />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Quick Action Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-ui tracking-tight">
              Центр управления миссиями
            </h1>
            <p className="text-muted-foreground font-ui">
              Активных миссий: {activeMissions.filter(m => m.status === 'in_flight').length} | 
              Готов к полету: {droneFleet.filter(d => d.status === 'ready').length} | 
              Всего единиц: {droneFleet.length}
            </p>
          </div>
          <Button variant="mission" size="lg">
            <Plane className="h-5 w-5 mr-2" />
            Новая миссия
          </Button>
        </div>

        {/* Weather & Conditions */}
        <Card className="bg-surface-1 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-ui">
              <Wind className="h-5 w-5 text-primary" />
              Погодные условия
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Ветер:</span>
                <span className="font-mono font-semibold">7 м/с СВ</span>
                <StatusChip variant="ready" className="text-xs">ОК</StatusChip>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Температура:</span>
                <span className="font-mono font-semibold">+12°C</span>
                <StatusChip variant="ready" className="text-xs">ОК</StatusChip>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Видимость:</span>
                <span className="font-mono font-semibold">8.5 км</span>
                <StatusChip variant="ready" className="text-xs">ОК</StatusChip>
              </div>
              <div className="flex items-center gap-2">
                <Satellite className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">GPS сигнал:</span>
                <span className="font-mono font-semibold">Отличный</span>
                <StatusChip variant="ready" className="text-xs">ОК</StatusChip>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Missions */}
        <div>
          <h2 className="text-xl font-bold font-ui mb-4">Активные миссии</h2>
          <div className="grid gap-4">
            {activeMissions.map((mission) => (
              <Card key={mission.id} className="bg-surface-1 border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-ui">{mission.name}</CardTitle>
                      <CardDescription className="font-mono text-sm">
                        ID: {mission.id} | Дрон: {mission.drone}
                      </CardDescription>
                    </div>
                    <StatusChip variant={getStatusVariant(mission.status)}>
                      {getStatusText(mission.status)}
                    </StatusChip>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Точки маршрута:</span>
                      <div className="font-mono font-semibold">{mission.waypoints}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Высота:</span>
                      <div className="font-mono font-semibold">{mission.altitude}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Время в полете:</span>
                      <div className="font-mono font-semibold">{mission.duration}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Прогресс:</span>
                      <div className="font-mono font-semibold">{mission.progress}%</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        Карта
                      </Button>
                      <Button variant="outline" size="sm">
                        <Target className="h-4 w-4 mr-1" />
                        Детали
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Drone Fleet Status */}
        <div>
          <h2 className="text-xl font-bold font-ui mb-4">Состояние флота</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {droneFleet.map((drone) => (
              <Card key={drone.id} className="bg-surface-1 border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-ui text-lg">{drone.name}</CardTitle>
                    <StatusChip variant={getStatusVariant(drone.status)}>
                      {getStatusText(drone.status)}
                    </StatusChip>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Батарея:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{drone.battery}%</span>
                      <StatusChip 
                        variant={drone.battery > 50 ? 'ready' : drone.battery > 20 ? 'warning' : 'critical'}
                        className="text-xs"
                      >
                        {drone.battery > 50 ? 'ОК' : drone.battery > 20 ? 'НИЗКО' : 'КРИТИЧНО'}
                      </StatusChip>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Температура:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{drone.temperature}°C</span>
                      <StatusChip 
                        variant={drone.temperature < 45 ? 'ready' : 'warning'}
                        className="text-xs"
                      >
                        {drone.temperature < 45 ? 'ОК' : 'ВЫСОКАЯ'}
                      </StatusChip>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">RSSI:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold">{drone.rssi} dBm</span>
                      <StatusChip 
                        variant={drone.rssi > -50 ? 'ready' : 'warning'}
                        className="text-xs"
                      >
                        {drone.rssi > -50 ? 'ОТЛИЧНО' : 'СЛАБО'}
                      </StatusChip>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground font-mono pt-2 border-t border-border">
                    Последний сигнал: {drone.lastSeen}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Map Placeholder */}
        <Card className="bg-surface-1 border-border">
          <CardHeader>
            <CardTitle className="font-ui flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Тактическая карта
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-surface-2 rounded-lg flex items-center justify-center border border-border">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground font-ui">
                  Интеграция с картографическим сервисом
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  Mapbox GL JS integration pending
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MissionControl;