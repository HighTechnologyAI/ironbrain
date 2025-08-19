import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { VPSService } from '@/services/vpsService';
import { AlertTriangle, CheckCircle, XCircle, Wifi } from 'lucide-react';

export function VPSStatusDebugger() {
  const [isChecking, setIsChecking] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const runDiagnostics = async () => {
    setIsChecking(true);
    try {
      const diagnostics = await VPSService.checkConnectionHealth();
      
      // Дополнительные тесты для отладки проблем из отчета
      const rtspStreams = await VPSService.getActiveStreams();
      const vpsDrones = await VPSService.getVPSDrones();
      
      setDebugInfo({
        ...diagnostics,
        rtspStreams: rtspStreams.data || [],
        vpsDrones: vpsDrones.data || [],
        rtspSuccess: rtspStreams.success,
        dronesSuccess: vpsDrones.success,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      setDebugInfo({
        overall: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка',
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wifi className="h-5 w-5" />
          VPS Status Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? 'Проверка...' : 'Запустить диагностику'}
        </Button>

        {debugInfo && (
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Диагностика завершена в {debugInfo.timestamp}
              </AlertDescription>
            </Alert>

            {/* Общий статус */}
            <div className="flex items-center gap-2">
              {getStatusIcon(debugInfo.overall)}
              <span className="font-medium">
                Общий статус: {debugInfo.overall ? 'OK' : 'Есть проблемы'}
              </span>
            </div>

            {/* Статус сервисов */}
            {debugInfo.services && (
              <div className="grid gap-2">
                <h4 className="font-medium">Сервисы:</h4>
                {Object.entries(debugInfo.services).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between">
                    <span>{service}</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status as boolean)}
                      <Badge variant={status ? 'default' : 'destructive'}>
                        {status ? 'OK' : 'ОШИБКА'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* RTSP потоки */}
            {debugInfo.rtspSuccess && debugInfo.rtspStreams && (
              <div className="space-y-2">
                <h4 className="font-medium">RTSP потоки ({debugInfo.rtspStreams.length}):</h4>
                {debugInfo.rtspStreams.map((stream: any, index: number) => (
                  <div key={index} className="text-sm p-2 border rounded">
                    <div>Дрон: {stream.drone_id}</div>
                    <div>Поток: {stream.stream_name}</div>
                    <div>URL: {stream.output_url}</div>
                    <Badge variant={stream.active ? 'default' : 'secondary'}>
                      {stream.active ? 'Активен' : 'Неактивен'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Дроны из VPS */}
            {debugInfo.dronesSuccess && debugInfo.vpsDrones && (
              <div className="space-y-2">
                <h4 className="font-medium">Дроны VPS ({debugInfo.vpsDrones.length}):</h4>
                {debugInfo.vpsDrones.map((drone: any, index: number) => (
                  <div key={index} className="text-sm p-2 border rounded">
                    <div>Имя: {drone.name}</div>
                    <div>Модель: {drone.model}</div>
                    <div>Батарея: {drone.battery_level * 100}%</div>
                    <Badge variant={drone.status === 'online' ? 'default' : 'secondary'}>
                      {drone.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Ошибки */}
            {debugInfo.errors && debugInfo.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Ошибки:</h4>
                {debugInfo.errors.map((error: string, index: number) => (
                  <Alert key={index} variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {debugInfo.error && (
              <Alert variant="destructive">
                <AlertDescription>{debugInfo.error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}