import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Settings, 
  CheckCircle, 
  XCircle,
  Clock,
  Terminal,
  Plane,
  Radio
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface APITest {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  expectedResponse: string;
  status: 'pending' | 'testing' | 'success' | 'error';
  result?: any;
  description: string;
}

export const Phase3Preparation: React.FC = () => {
  const [tests, setTests] = useState<APITest[]>([
    {
      id: 'health',
      name: 'VPS Health Check',
      endpoint: '/health',
      method: 'GET',
      expectedResponse: 'Service status and version',
      status: 'pending',
      description: 'Проверка работоспособности основного API'
    },
    {
      id: 'drones',
      name: 'Drone Telemetry',
      endpoint: '/drones',
      method: 'GET', 
      expectedResponse: 'Current drone status and telemetry',
      status: 'pending',
      description: 'Получение текущей телеметрии дрона'
    },
    {
      id: 'api-health',
      name: 'API Gateway Health',
      endpoint: '/api/v1/health',
      method: 'GET',
      expectedResponse: 'API gateway status',
      status: 'pending',
      description: 'Проверка API Gateway для команд управления'
    },
    {
      id: 'commands',
      name: 'Command Endpoint',
      endpoint: '/api/v1/drones/jetson_nano_real_001/command',
      method: 'POST',
      expectedResponse: 'Command execution status',
      status: 'pending',
      description: 'Проверка возможности отправки команд дрону'
    },
    {
      id: 'status',
      name: 'Drone Status Detail',
      endpoint: '/api/v1/drones/jetson_nano_real_001/status',
      method: 'GET',
      expectedResponse: 'Detailed drone status',
      status: 'pending',
      description: 'Получение детального статуса конкретного дрона'
    },
    {
      id: 'mission',
      name: 'Mission Commands',
      endpoint: '/api/v1/missions',
      method: 'GET',
      expectedResponse: 'Available missions or mission status',
      status: 'pending',
      description: 'Проверка поддержки команд миссий'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const testEndpoint = async (test: APITest) => {
    try {
      updateTestStatus(test.id, 'testing');

      const requestBody = test.method === 'POST' ? {
        method: test.method,
        endpoint: test.endpoint,
        payload: test.id === 'commands' ? { command: 'status' } : undefined
      } : {
        method: test.method,
        endpoint: test.endpoint
      };

      const { data, error } = await supabase.functions.invoke('vps-supabase-proxy', {
        body: requestBody
      });

      if (error) {
        updateTestStatus(test.id, 'error', { error: error.message });
        return;
      }

      updateTestStatus(test.id, 'success', data);
    } catch (error) {
      updateTestStatus(test.id, 'error', { error: String(error) });
    }
  };

  const updateTestStatus = (testId: string, status: APITest['status'], result?: any) => {
    setTests(prev => prev.map(test => 
      test.id === testId 
        ? { ...test, status, result }
        : test
    ));
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending', result: undefined })));
    
    // Run tests sequentially with delay
    for (const test of tests) {
      await testEndpoint(test);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between tests
    }
    
    setIsRunning(false);
    toast.success('Тестирование завершено');
  };

  const getStatusIcon = (status: APITest['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'testing': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: APITest['status']) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'testing': return 'secondary';
      default: return 'outline';
    }
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            🔧 Подготовка к Фазе 3: Проверка API управления
          </CardTitle>
          <CardDescription>
            Тестирование доступности команд управления дроном на VPS/Jetson
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{successCount}</div>
                <div className="text-xs text-muted-foreground">Успешно</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-destructive">{errorCount}</div>
                <div className="text-xs text-muted-foreground">Ошибки</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{tests.length}</div>
                <div className="text-xs text-muted-foreground">Всего</div>
              </div>
            </div>
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Тестирование...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Запустить тесты
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tests */}
      <div className="space-y-3">
        {tests.map((test) => (
          <Card key={test.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <CardTitle className="text-base">{test.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {test.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusVariant(test.status)}>
                    {test.status.toUpperCase()}
                  </Badge>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => testEndpoint(test)}
                    disabled={isRunning}
                  >
                    Тест
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <div className="text-xs text-muted-foreground">
                <code>{test.method} {test.endpoint}</code>
              </div>
              <div className="text-xs">Ожидается: {test.expectedResponse}</div>
              
              {test.result && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer text-blue-600">
                    Результат теста
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(test.result, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            📋 Рекомендации для VPS/Jetson
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium">Если команды управления недоступны:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>1. Убедитесь что MAVLink подключен на Jetson</div>
              <div>2. Проверьте endpoints в VPS API для команд дрона</div>
              <div>3. Добавьте поддержку POST /api/v1/drones/[ID]/command</div>
              <div>4. Реализуйте команды: ARM, DISARM, TAKEOFF, LAND, RTL</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">Необходимые команды для Фазы 3:</h4>
            <div className="grid grid-cols-2 gap-1 text-sm">
              <div>• ARM (вооружить моторы)</div>
              <div>• DISARM (снять с вооружения)</div>
              <div>• TAKEOFF (взлет)</div>
              <div>• LAND (посадка)</div>
              <div>• RTL (возврат домой)</div>
              <div>• SET_MODE (смена режима)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};