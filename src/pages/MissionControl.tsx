import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/hooks/use-language';
import { useMissions } from '@/hooks/use-missions';
import { useDrones } from '@/hooks/use-drones';
import { useWeather } from '@/hooks/use-weather';
import TacticalMapModal from '@/components/TacticalMapModal';
import MapboxDebugger from '@/components/MapboxDebugger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/neon/StatusChip';
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
  Target,
  Loader2
} from 'lucide-react';

const MissionControl = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const { missions, loading: missionsLoading, error: missionsError } = useMissions();
  const { drones, loading: dronesLoading, error: dronesError } = useDrones();
  const { weather, loading: weatherLoading, getWindDirection } = useWeather();

  if (missionsLoading || dronesLoading || weatherLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="font-ui">Загрузка данных миссий...</span>
        </div>
      </div>
    );
  }

  if (missionsError || dronesError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Ошибка загрузки данных</h2>
          <p className="text-muted-foreground">{missionsError || dronesError}</p>
        </div>
      </div>
    );
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ready': return 'ready';
      case 'armed': return 'armed';
      case 'in_flight': return 'flying';
      case 'warning': return 'warning';
      case 'critical': return 'critical';
      case 'offline': return 'offline';
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
      case 'offline': return 'ОФЛАЙН';
      default: return status.toUpperCase();
    }
  };

  const formatDuration = (startTime?: string) => {
    if (!startTime) return '00:00';
    
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (lastContact?: string) => {
    if (!lastContact) return 'неизвестно';
    
    const now = new Date();
    const contact = new Date(lastContact);
    const diffMs = now.getTime() - contact.getTime();
    
    if (diffMs < 60000) return `${Math.floor(diffMs / 1000)}s ago`;
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
    return `${Math.floor(diffMs / 3600000)}h ago`;
  };

  // Filter active missions
  const activeMissions = missions.filter(m => m.status === 'in_flight' || m.status === 'armed');
  const readyDrones = drones.filter(d => d.status === 'ready').length;

  return (
    <div className="min-h-screen bg-background">
      <AppNavigation title={t.missionControlTitle} subtitle={t.missionControlCenter} />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Quick Action Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-ui tracking-tight">
              Центр управления миссиями
            </h1>
            <p className="text-muted-foreground font-ui">
              Активных миссий: {activeMissions.filter(m => m.status === 'in_flight').length} | 
              Готов к полету: {readyDrones} | 
              Всего единиц: {drones.length}
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
              Погодные условия - {weather?.location || 'Timarevo Airfield'}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Координаты: 43°23'20.2"N 26°53'07.6"E | Обновлено: {new Date().toLocaleTimeString('ru-RU')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Ветер:</span>
                <span className="font-mono font-semibold">
                  {weather?.wind_speed || 0} м/с {getWindDirection(weather?.wind_direction || 0)}
                </span>
                <StatusChip status={
                  !weather?.wind_speed ? 'offline' :
                  weather.wind_speed <= 10 ? 'ready' : 
                  weather.wind_speed <= 15 ? 'warning' : 'critical'
                } size="sm">
                  {!weather?.wind_speed ? 'N/A' :
                   weather.wind_speed <= 10 ? 'ОК' : 
                   weather.wind_speed <= 15 ? 'УМЕР' : 'ОПАСНО'}
                </StatusChip>
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Температура:</span>
                <span className="font-mono font-semibold">{weather?.temperature || 0}°C</span>
                <StatusChip status="ready" size="sm">ОК</StatusChip>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Видимость:</span>
                <span className="font-mono font-semibold">{weather?.visibility || 0} км</span>
                <StatusChip status={
                  !weather?.visibility ? 'offline' :
                  weather.visibility >= 5 ? 'ready' : 
                  weather.visibility >= 3 ? 'warning' : 'critical'
                } size="sm">
                  {!weather?.visibility ? 'N/A' :
                   weather.visibility >= 5 ? 'ОК' : 
                   weather.visibility >= 3 ? 'СНИЖ' : 'ПЛОХО'}
                </StatusChip>
              </div>
              <div className="flex items-center gap-2">
                <Satellite className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Давление:</span>
                <span className="font-mono font-semibold">{weather?.pressure || 1013} гПа</span>
                <StatusChip status="ready" size="sm">ОК</StatusChip>
              </div>
            </div>
            {weather?.weather_condition && (
              <div className="mt-3 pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">Условия: </span>
                <span className="text-sm font-medium capitalize">{weather.weather_condition}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Missions */}
        <div>
          <h2 className="text-xl font-bold font-ui mb-4">Активные миссии</h2>
          {activeMissions.length === 0 ? (
            <Card className="bg-surface-1 border-border">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Нет активных миссий</h3>
                  <p className="text-muted-foreground">Создайте новую миссию для начала операций</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeMissions.map((mission) => (
                <Card key={mission.id} className="bg-surface-1 border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-ui">{mission.name}</CardTitle>
                        <CardDescription className="font-mono text-sm">
                          ID: {mission.id.slice(0, 8)} | Дрон: {mission.drone?.name || 'Не назначен'}
                        </CardDescription>
                      </div>
                      <StatusChip status={getStatusVariant(mission.status)}>
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
                        <div className="font-mono font-semibold">
                          {mission.altitude_meters ? `${mission.altitude_meters}м` : 'Не задана'}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Время в полете:</span>
                        <div className="font-mono font-semibold">{formatDuration(mission.start_time)}</div>
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
          )}
        </div>

        {/* Drone Fleet Status */}
        <div>
          <h2 className="text-xl font-bold font-ui mb-4">Состояние флота</h2>
          {drones.length === 0 ? (
            <Card className="bg-surface-1 border-border">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Флот дронов пуст</h3>
                  <p className="text-muted-foreground">Добавьте дроны для управления флотом</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drones.map((drone) => (
                <Card key={drone.id} className="bg-surface-1 border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-ui text-lg">{drone.name}</CardTitle>
                        <CardDescription className="text-xs font-mono">
                          {drone.model} • {drone.serial}
                        </CardDescription>
                      </div>
                      <StatusChip status={getStatusVariant(drone.status || 'offline')}>
                        {getStatusText(drone.status || 'offline')}
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
                        <span className="font-mono font-semibold">
                          {drone.battery_level ? `${Math.round(drone.battery_level)}%` : 'N/A'}
                        </span>
                        <StatusChip 
                          status={
                            !drone.battery_level ? 'offline' :
                            drone.battery_level > 50 ? 'ready' : 
                            drone.battery_level > 20 ? 'warning' : 'critical'
                          }
                          size="sm"
                        >
                          {!drone.battery_level ? 'N/A' :
                           drone.battery_level > 50 ? 'ОК' : 
                           drone.battery_level > 20 ? 'НИЗКО' : 'КРИТИЧНО'}
                        </StatusChip>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Прошивка:</span>
                      </div>
                      <span className="font-mono text-sm">{drone.firmware || 'N/A'}</span>
                    </div>
                    
                    {drone.location_lat && drone.location_lon && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground">Позиция:</span>
                        </div>
                        <span className="font-mono text-xs">
                          {drone.location_lat.toFixed(4)}, {drone.location_lon.toFixed(4)}
                        </span>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground font-mono pt-2 border-t border-border">
                      Последний сигнал: {getTimeAgo(drone.last_contact)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Tactical Map */}
        <Card className="bg-surface-1 border-border">
          <CardHeader>
            <CardTitle className="font-ui flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Тактическая карта
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Нажмите для открытия полноэкранной интерактивной карты с позициями дронов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TacticalMapModal drones={drones} />
            
            {/* API Debugger */}
            <div className="pt-4 border-t border-border">
              <MapboxDebugger />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MissionControl;