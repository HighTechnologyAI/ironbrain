import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ValidationResult {
  component: string;
  status: 'checking' | 'success' | 'error';
  message?: string;
  details?: any;
}

export const JetsonVPSValidator: React.FC = () => {
  const [validations, setValidations] = useState<ValidationResult[]>([
    { component: 'VPS Health Check', status: 'checking' },
    { component: 'VPS Drone API', status: 'checking' },
    { component: 'VPS Video Stream', status: 'checking' },
    { component: 'Jetson GCS Backend', status: 'checking' },
    { component: 'Jetson Thermal Camera', status: 'checking' },
    { component: 'Edge Function Bridge', status: 'checking' }
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const updateValidation = (component: string, status: ValidationResult['status'], message?: string, details?: any) => {
    setValidations(prev => prev.map(v => 
      v.component === component 
        ? { ...v, status, message, details }
        : v
    ));
  };

  const runValidation = async () => {
    setIsRunning(true);
    
    try {
      // 1. Test Edge Function Bridge
      updateValidation('Edge Function Bridge', 'checking');
      try {
        const { data: bridgeHealth } = await supabase.functions.invoke('jetson-vps-bridge', {
          body: { action: 'health' }
        });
        
        if (bridgeHealth?.success) {
          updateValidation('Edge Function Bridge', 'success', 'Bridge функция активна', bridgeHealth);
        } else {
          updateValidation('Edge Function Bridge', 'error', 'Bridge функция недоступна');
        }
      } catch (error) {
        updateValidation('Edge Function Bridge', 'error', `Error: ${error.message}`);
      }

      // 2. Test VPS Health
      updateValidation('VPS Health Check', 'checking');
      try {
        const response = await fetch('http://87.120.254.156:5761/health', {
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          const data = await response.json();
          updateValidation('VPS Health Check', 'success', `VPS API активен (${data.version})`, data);
        } else {
          updateValidation('VPS Health Check', 'error', `HTTP ${response.status}`);
        }
      } catch (error) {
        updateValidation('VPS Health Check', 'error', `Соединение не установлено: ${error.message}`);
      }

      // 3. Test VPS Drone API
      updateValidation('VPS Drone API', 'checking');
      try {
        const response = await fetch('http://87.120.254.156:5761/api/v1/drone/status', {
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          const data = await response.json();
          updateValidation('VPS Drone API', 'success', `Телеметрия получена (${data.battery_level}% батарея)`, data);
        } else {
          updateValidation('VPS Drone API', 'error', `HTTP ${response.status}`);
        }
      } catch (error) {
        updateValidation('VPS Drone API', 'error', `API недоступен: ${error.message}`);
      }

      // 4. Test VPS Video Stream
      updateValidation('VPS Video Stream', 'checking');
      try {
        const response = await fetch('http://87.120.254.156:5761/api/v1/video/stream', {
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          const data = await response.json();
          updateValidation('VPS Video Stream', 'success', `RTSP поток доступен`, data);
        } else {
          updateValidation('VPS Video Stream', 'error', `HTTP ${response.status}`);
        }
      } catch (error) {
        updateValidation('VPS Video Stream', 'error', `Видеопоток недоступен: ${error.message}`);
      }

      // 5. Test Jetson GCS Backend
      updateValidation('Jetson GCS Backend', 'checking');
      try {
        const response = await fetch('http://192.168.1.236:5000/api/health', {
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          const data = await response.json();
          updateValidation('Jetson GCS Backend', 'success', `Jetson GCS активен (${data.device_id})`, data);
        } else {
          updateValidation('Jetson GCS Backend', 'error', `HTTP ${response.status}`);
        }
      } catch (error) {
        updateValidation('Jetson GCS Backend', 'error', `Jetson недоступен: ${error.message}`);
      }

      // 6. Test Thermal Camera
      updateValidation('Jetson Thermal Camera', 'checking');
      try {
        const response = await fetch('http://192.168.1.236:5000/api/thermal/snapshot', {
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          const data = await response.json();
          updateValidation('Jetson Thermal Camera', 'success', `Тепловизор активен (${data.hotspots?.length || 0} горячих точек)`, data);
        } else {
          updateValidation('Jetson Thermal Camera', 'error', `HTTP ${response.status}`);
        }
      } catch (error) {
        updateValidation('Jetson Thermal Camera', 'error', `Тепловизор недоступен: ${error.message}`);
      }

    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runValidation();
  }, []);

  const getStatusIcon = (status: ValidationResult['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: ValidationResult['status']) => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary">Проверка...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-success/10 text-success border-success/20">✅ Готов</Badge>;
      case 'error':
        return <Badge variant="destructive">❌ Ошибка</Badge>;
    }
  };

  const allSuccess = validations.every(v => v.status === 'success');
  const hasErrors = validations.some(v => v.status === 'error');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 ФАЗА 1: Валидация готовности системы
          <Button
            onClick={runValidation}
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Перепроверить
          </Button>
        </CardTitle>
        <CardDescription>
          Проверка готовности VPS (87.120.254.156) и Jetson (192.168.1.236) компонентов
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {validations.map((validation) => (
          <div key={validation.component} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(validation.status)}
              <div>
                <div className="font-medium">{validation.component}</div>
                {validation.message && (
                  <div className="text-sm text-muted-foreground">{validation.message}</div>
                )}
              </div>
            </div>
            {getStatusBadge(validation.status)}
          </div>
        ))}
        
        <div className="pt-4 border-t">
          {allSuccess && (
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2 text-success font-medium">
                <CheckCircle className="h-5 w-5" />
                🎉 ВСЕ КОМПОНЕНТЫ ГОТОВЫ! Переходим к Фазе 2: Базовая интеграция
              </div>
            </div>
          )}
          
          {hasErrors && !allSuccess && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive font-medium">
                <XCircle className="h-5 w-5" />
                ⚠️ Обнаружены проблемы. Требуется устранение перед продолжением.
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};