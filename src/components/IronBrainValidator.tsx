import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, AlertTriangle, RefreshCw, Cpu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ValidationResult {
  id: string;
  name: string;
  description: string;
  status: 'checking' | 'ready' | 'error' | 'attention';
  details?: any;
}

interface DroneInfo {
  device_id: string;
  status: string;
  last_seen: string;
  battery_level?: number;
  location?: { lat: number; lng: number; };
}

export function IronBrainValidator() {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [connectedDrones, setConnectedDrones] = useState<DroneInfo[]>([]);

  const VPS_API_BASE = "http://87.120.254.156:5761";

  const initializeValidation = () => {
    setValidationResults([
      { 
        id: 'vps-health', 
        name: 'VPS Health Check', 
        description: 'Проверка IronBrain VPS (87.120.254.156:5761)', 
        status: 'checking' 
      },
      { 
        id: 'vps-api', 
        name: 'VPS API Gateway', 
        description: 'Проверка API для управления дронами', 
        status: 'checking' 
      },
      { 
        id: 'drone-registry', 
        name: 'Drone Registry', 
        description: 'Проверка реестра подключенных дронов', 
        status: 'checking' 
      },
      { 
        id: 'websocket-bridge', 
        name: 'WebSocket Bridge', 
        description: 'Проверка real-time соединения с VPS', 
        status: 'checking' 
      }
    ]);
  };

  const updateResult = (id: string, status: ValidationResult['status'], description: string, details?: any) => {
    setValidationResults(prev => prev.map(result => 
      result.id === id ? { ...result, status, description, details } : result
    ));
  };

  const testVPSEndpoint = async (endpoint: string, timeout = 10000) => {
    try {
      const { data, error } = await supabase.functions.invoke('vps-supabase-proxy', {
        body: {
          method: 'GET',
          endpoint
        }
      });

      if (error) throw new Error(error.message);

      // If proxy reported an error shape
      if (data && typeof data === 'object' && 'error' in data && !('status' in data)) {
        throw new Error((data as any).details || (data as any).error || 'VPS proxy error');
      }

      return data;
    } catch (error) {
      console.error('VPS Endpoint Error:', error);
      throw error;
    }
  };

  const runValidation = async () => {
    setIsValidating(true);
    initializeValidation();
    setConnectedDrones([]);

    // 1. VPS Health Check (порт 5761)
    try {
      const healthData = await testVPSEndpoint('/api/v1/health');
      
      if (healthData.status === 'ok') {
        updateResult('vps-health', 'ready', `IronBrain активен: ${healthData.service} v${healthData.version}`, healthData);
      } else {
        updateResult('vps-health', 'attention', 'VPS отвечает, но есть проблемы', healthData);
      }
    } catch (error) {
      updateResult('vps-health', 'error', `VPS недоступен: ${error.message}`);
    }

    // 2. VPS API Gateway
    try {
      const apiData = await testVPSEndpoint('/api/v1/status');
      
      if (apiData.api_status === 'active') {
        updateResult('vps-api', 'ready', `API Gateway активен: ${apiData.active_endpoints} endpoints`);
      } else {
        updateResult('vps-api', 'attention', 'API Gateway работает, но не все endpoints активны');
      }
    } catch (error) {
      updateResult('vps-api', 'error', `API Gateway недоступен: ${error.message}`);
    }

    // 3. Drone Registry
    try {
      const dronesData = await testVPSEndpoint('/api/v1/drones');
      
      if (Array.isArray(dronesData.drones)) {
        const activeDrones = dronesData.drones.filter((d: DroneInfo) => d.status === 'online');
        setConnectedDrones(dronesData.drones);
        
        if (activeDrones.length > 0) {
          updateResult('drone-registry', 'ready', `${activeDrones.length} дронов подключено из ${dronesData.drones.length} зарегистрированных`);
        } else if (dronesData.drones.length > 0) {
          updateResult('drone-registry', 'attention', `${dronesData.drones.length} дронов зарегистрировано, но все offline`);
        } else {
          updateResult('drone-registry', 'attention', 'Реестр дронов пуст - дроны не подключены');
        }
      } else {
        updateResult('drone-registry', 'error', 'Некорректный ответ от реестра дронов');
      }
    } catch (error) {
      updateResult('drone-registry', 'error', `Реестр дронов недоступен: ${error.message}`);
    }

    // 4. WebSocket Bridge Test
    try {
      const wsData = await testVPSEndpoint('/api/v1/websocket/status');
      
      if (wsData.websocket_active) {
        updateResult('websocket-bridge', 'ready', `WebSocket активен: ${wsData.connected_clients} клиентов подключено`);
      } else {
        updateResult('websocket-bridge', 'error', 'WebSocket сервис неактивен');
      }
    } catch (error) {
      updateResult('websocket-bridge', 'error', `WebSocket недоступен: ${error.message}`);
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧠 ФАЗА 1: Валидация IronBrain VPS
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
          </CardTitle>
          <CardDescription>
            Проверка подключения к IronBrain VPS (87.120.254.156:5761) - единственной точки доступа к дронам
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
          
          {connectedDrones.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                🤖 Подключенные дроны через VPS
              </h4>
              <div className="space-y-2">
                {connectedDrones.map((drone, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <div className="font-mono text-sm font-semibold">{drone.device_id}</div>
                      <div className="text-xs text-muted-foreground">
                        Last seen: {new Date(drone.last_seen).toLocaleString()}
                        {drone.battery_level && ` • Battery: ${drone.battery_level}%`}
                      </div>
                    </div>
                    <Badge variant={drone.status === 'online' ? 'default' : 'secondary'}>
                      {drone.status === 'online' ? '🟢 Online' : '🔴 Offline'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {allReady && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">🎉 IRONBRAIN VPS ГОТОВ! Переходим к управлению дронами через API</span>
              </div>
            </div>
          )}
          
          {hasErrors && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">⚠️ Проблемы с VPS подключением. Проверьте доступность 87.120.254.156:5761</span>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h5 className="font-semibold text-gray-900 mb-2">📡 Архитектура подключения</h5>
            <div className="text-sm text-gray-700 space-y-1">
              <div>• Tiger CRM → VPS API (87.120.254.156:5761)</div>
              <div>• VPS → Jetson (автоматическое подключение)</div>
              <div>• Управление только через Device ID дронов</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}