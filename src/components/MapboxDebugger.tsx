import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, AlertTriangle, Zap } from 'lucide-react';

const MapboxDebugger: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testMapboxAPI = async () => {
    setTesting(true);
    setResult(null);
    setError(null);
    
    console.log('🧪 Начинаем тестирование Mapbox API...');
    
    try {
      console.log('📡 Вызываем edge function get-mapbox-token...');
      const start = Date.now();
      
      const { data, error: funcError } = await supabase.functions.invoke('get-mapbox-token');
      
      const duration = Date.now() - start;
      console.log(`⏱️ Edge function ответил за ${duration}ms`);
      console.log('📦 Данные:', data);
      console.log('❌ Ошибка:', funcError);
      
      if (funcError) {
        setError(`Edge function ошибка: ${JSON.stringify(funcError)}`);
        setTesting(false);
        return;
      }
      
      if (!data?.token) {
        setError(`Токен не найден в ответе: ${JSON.stringify(data)}`);
        setTesting(false);
        return;
      }
      
      // Проверяем что токен действительно работает с Mapbox API
      console.log('🌍 Тестируем токен с реальным API Mapbox...');
      const mapboxResponse = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/bulgaria.json?access_token=${data.token}`);
      
      if (!mapboxResponse.ok) {
        const errorText = await mapboxResponse.text();
        setError(`Mapbox API ошибка ${mapboxResponse.status}: ${errorText}`);
        setTesting(false);
        return;
      }
      
      const geocodingResult = await mapboxResponse.json();
      console.log('✅ Mapbox API работает!', geocodingResult);
      
      setResult({
        token_received: true,
        token_length: data.token.length,
        token_preview: data.token.substring(0, 10) + '...',
        edge_function_duration: duration,
        mapbox_api_test: 'success',
        geocoding_results: geocodingResult.features?.length || 0
      });
      
    } catch (err) {
      console.error('💥 Ошибка тестирования:', err);
      setError(`Общая ошибка: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    }
    
    setTesting(false);
  };

  return (
    <Card className="bg-surface-1 border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Mapbox API Диагностика
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testMapboxAPI} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Тестирование...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Тестировать API
            </>
          )}
        </Button>
        
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-semibold">Ошибка:</span>
            </div>
            <pre className="text-xs text-destructive/80 overflow-auto">{error}</pre>
          </div>
        )}
        
        {result && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 text-primary mb-2">
              <CheckCircle className="h-4 w-4" />
              <span className="font-semibold">Результат:</span>
            </div>
            <pre className="text-xs text-primary/80 overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Тестирует edge function get-mapbox-token</p>
          <p>• Проверяет работу реального Mapbox API</p>
          <p>• Показывает детальную диагностику</p>
          <p>• Открой консоль браузера для полных логов</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MapboxDebugger;