import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, AlertTriangle, RefreshCw, Network } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { JetsonNetworkScanner } from './JetsonNetworkScanner';

interface ValidationResult {
  id: string;
  name: string;
  description: string;
  status: 'checking' | 'ready' | 'error' | 'attention';
  details?: any;
}

export function JetsonVPSValidator() {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [showNetworkScanner, setShowNetworkScanner] = useState(false);
  const [jetsonConfig, setJetsonConfig] = useState({ ip: '192.168.1.236', port: 5000 });

  const initializeValidation = () => {
    setValidationResults([
      { 
        id: 'vps-health', 
        name: 'VPS Health Check', 
        description: 'Проверка VPS (87.120.254.156)', 
        status: 'checking' 
      },
      { 
        id: 'vps-api', 
        name: 'VPS Drone API', 
        description: 'Проверка API телеметрии', 
        status: 'checking' 
      },
      { 
        id: 'vps-video', 
        name: 'VPS Video Stream', 
        description: 'Проверка видеопотока RTSP', 
        status: 'checking' 
      },
      { 
        id: 'jetson-backend', 
        name: 'Jetson GCS Backend', 
        description: `Проверка ${jetsonConfig.ip}:${jetsonConfig.port}`, 
        status: 'checking' 
      },
      { 
        id: 'jetson-camera', 
        name: 'Jetson Thermal Camera', 
        description: 'Проверка USB тепловизора', 
        status: 'checking' 
      },
      { 
        id: 'edge-bridge', 
        name: 'Edge Function Bridge', 
        description: 'Проверка Supabase Edge Functions', 
        status: 'checking' 
      }
    ]);
  };

  const updateResult = (id: string, status: ValidationResult['status'], description: string, details?: any) => {
    setValidationResults(prev => prev.map(result => 
      result.id === id ? { ...result, status, description, details } : result
    ));
  };

  const runValidation = async () => {
    setIsValidating(true);
    initializeValidation();

    // 1. Edge Function Bridge Test
    try {
      const bridgeResult = await supabase.functions.invoke('jetson-vps-bridge', {
        body: { action: 'health' }
      });

      if (bridgeResult.data?.success) {
        updateResult('edge-bridge', 'ready', 'Bridge функция активна');
      } else {
        updateResult('edge-bridge', 'error', bridgeResult.data?.error || 'Bridge недоступен');
      }
    } catch (error) {
      updateResult('edge-bridge', 'error', `Ошибка bridge: ${error.message}`);
    }

    // 2. VPS Health Check via Edge Function
    try {
      const vpsResult = await supabase.functions.invoke('jetson-vps-bridge', {
        body: { action: 'vps_health' }
      });

      if (vpsResult.data?.success && vpsResult.data?.vps_status) {
        updateResult('vps-health', 'ready', `VPS активен: ${vpsResult.data.vps_status.service} v${vpsResult.data.vps_status.version}`);
      } else {
        updateResult('vps-health', 'error', vpsResult.data?.error || 'VPS недоступен');
      }
    } catch (error) {
      updateResult('vps-health', 'error', `Ошибка подключения к VPS: ${error.message}`);
    }

    // 3. VPS Drone API
    try {
      const droneResult = await supabase.functions.invoke('jetson-vps-bridge', {
        body: { action: 'vps_drone_status' }
      });

      if (droneResult.data?.success && droneResult.data?.drone_status) {
        updateResult('vps-api', 'ready', `Телеметрия получена: ${droneResult.data.drone_status.battery_level}% батарея`);
      } else {
        updateResult('vps-api', 'attention', droneResult.data?.error || 'Нет данных телеметрии');
      }
    } catch (error) {
      updateResult('vps-api', 'error', `Ошибка API: ${error.message}`);
    }

    // 4. VPS Video Stream
    try {
      const videoResult = await supabase.functions.invoke('jetson-vps-bridge', {
        body: { action: 'vps_video_status' }
      });

      if (videoResult.data?.success && videoResult.data?.video_status) {
        updateResult('vps-video', 'ready', `RTSP поток доступен: ${videoResult.data.video_status.stream_url}`);
      } else {
        updateResult('vps-video', 'attention', videoResult.data?.error || 'Видеопоток недоступен');
      }
    } catch (error) {
      updateResult('vps-video', 'error', `Ошибка видео: ${error.message}`);
    }

    // 5. Jetson GCS Backend
    try {
      const jetsonResult = await supabase.functions.invoke('jetson-vps-bridge', {
        body: { 
          action: 'jetson_health',
          jetson_ip: jetsonConfig.ip,
          jetson_port: jetsonConfig.port
        }
      });

      if (jetsonResult.data?.success && jetsonResult.data?.jetson_status) {
        updateResult('jetson-backend', 'ready', `Jetson активен: ${jetsonResult.data.jetson_status.service} v${jetsonResult.data.jetson_status.version}`);
      } else {
        updateResult('jetson-backend', 'error', jetsonResult.data?.error || 'Jetson недоступен');
      }
    } catch (error) {
      updateResult('jetson-backend', 'error', `Ошибка подключения к Jetson: ${error.message}`);
    }

    // 6. Jetson Thermal Camera
    try {
      const cameraResult = await supabase.functions.invoke('jetson-vps-bridge', {
        body: { 
          action: 'jetson_camera',
          jetson_ip: jetsonConfig.ip,
          jetson_port: jetsonConfig.port
        }
      });

      if (cameraResult.data?.success && cameraResult.data?.camera_status) {
        updateResult('jetson-camera', 'ready', `Тепловизор активен: ${cameraResult.data.camera_status.device} (${cameraResult.data.camera_status.resolution})`);
      } else {
        updateResult('jetson-camera', 'attention', cameraResult.data?.error || 'Тепловизор не найден');
      }
    } catch (error) {
      updateResult('jetson-camera', 'error', `Ошибка проверки камеры: ${error.message}`);
    }

    setIsValidating(false);
  };

  useEffect(() => {
    initializeValidation();
    runValidation();
  }, []);

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'attention':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: ValidationResult['status']) => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary">Проверка...</Badge>;
      case 'ready':
        return <Badge className="bg-green-500">✅ Готов</Badge>;
      case 'attention':
        return <Badge variant="secondary" className="bg-yellow-500">⚠️ Внимание</Badge>;
      case 'error':
        return <Badge variant="destructive">❌ Ошибка</Badge>;
    }
  };

  const allReady = validationResults.every(r => r.status === 'ready');
  const hasErrors = validationResults.some(r => r.status === 'error');

  const handleJetsonFound = (ip: string, port: number, response: any) => {
    setJetsonConfig({ ip, port });
    setShowNetworkScanner(false);
    
    // Update the validation results immediately
    const updatedResults = validationResults.map(result => {
      if (result.id === 'jetson-backend') {
        return {
          ...result,
          description: `✅ Найден: ${ip}:${port} - ${response.service} v${response.version}`,
          status: 'ready' as const
        };
      }
      return result;
    });
    setValidationResults(updatedResults);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 ФАЗА 1: Валидация готовности системы
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runValidation}
              disabled={isValidating}
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Перепроверить
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowNetworkScanner(!showNetworkScanner)}
            >
              <Network className="h-4 w-4" />
              Найти Jetson
            </Button>
          </CardTitle>
          <CardDescription>
            Проверка готовности VPS (87.120.254.156) и Jetson ({jetsonConfig.ip}:{jetsonConfig.port}) компонентов
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {validationResults.map((result) => (
            <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(result.status)}
                <div>
                  <div className="font-medium">{result.name}</div>
                  <div className="text-sm text-muted-foreground">{result.description}</div>
                </div>
              </div>
              {getStatusBadge(result.status)}
            </div>
          ))}
          
          {allReady && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">🎉 ВСЕ КОМПОНЕНТЫ ГОТОВЫ! Переходим к Фазе 2: Базовая интеграция</span>
              </div>
            </div>
          )}
          
          {hasErrors && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">⚠️ Обнаружены проблемы. Требуется устранение перед продолжением.</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showNetworkScanner && (
        <JetsonNetworkScanner onJetsonFound={handleJetsonFound} />
      )}
    </div>
  );
}