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
    
    console.log('🧪 [MAPBOX DEBUG] Начинаем тестирование API...');
    
    try {
      console.log('📡 [STEP 1] Вызываем edge function get-mapbox-token...');
      const start = Date.now();
      
      // Пробуем сначала без токена, потом с токеном
      const response = await supabase.functions.invoke('get-mapbox-token', {
        body: { 
          token: 'pk.eyJ1IjoiaGlnaHRlY2hhaSIsImEiOiJjbWViZTBoaW0wbzVwMmpxdmFpeTVnbWdsIn0.8-x4oZ4TfetTTa5BEAXDYg' 
        }
      });
      
      const duration = Date.now() - start;
      console.log(`⏱️ [STEP 1] Edge function ответил за ${duration}ms`);
      console.log('📦 [STEP 1] Response data:', response.data);
      console.log('❌ [STEP 1] Response error:', response.error);
      
      if (response.error) {
        console.error('🚨 [ERROR] Edge function error:', response.error);
        setError(`Edge function error: ${JSON.stringify(response.error, null, 2)}`);
        setTesting(false);
        return;
      }
      
      if (!response.data?.token) {
        console.error('🚨 [ERROR] No token in response:', response.data);
        setError(`Токен не найден в ответе: ${JSON.stringify(response.data, null, 2)}`);
        setTesting(false);
        return;
      }
      
      const token = response.data.token;
      console.log(`✅ [STEP 1] Токен получен: ${token.substring(0, 20)}...`);
      
      // Проверяем формат токена
      if (!token.startsWith('pk.')) {
        console.error('🚨 [ERROR] Invalid token format:', token.substring(0, 10));
        setError(`Неверный формат токена. Ожидается 'pk.', получен: ${token.substring(0, 10)}`);
        setTesting(false);
        return;
      }
      
      // Тестируем токен с реальным Mapbox API
      console.log('🌍 [STEP 2] Тестируем токен с реальным API Mapbox...');
      const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/bulgaria.json?access_token=${token}`;
      
      console.log('🔗 [STEP 2] URL:', mapboxUrl.replace(token, 'TOKEN_HIDDEN'));
      
      const mapboxResponse = await fetch(mapboxUrl);
      console.log(`📊 [STEP 2] Mapbox API status: ${mapboxResponse.status}`);
      
      if (!mapboxResponse.ok) {
        const errorText = await mapboxResponse.text();
        console.error('🚨 [ERROR] Mapbox API error:', errorText);
        setError(`Mapbox API ошибка ${mapboxResponse.status}: ${errorText}`);
        setTesting(false);
        return;
      }
      
      const geocodingResult = await mapboxResponse.json();
      console.log('✅ [STEP 2] Mapbox API работает!', geocodingResult);
      
      setResult({
        success: true,
        token_received: true,
        token_length: token.length,
        token_prefix: token.substring(0, 3),
        token_preview: token.substring(0, 20) + '...',
        edge_function_duration: duration,
        mapbox_api_status: mapboxResponse.status,
        mapbox_api_test: 'SUCCESS',
        geocoding_results: geocodingResult.features?.length || 0,
        bulgaria_found: geocodingResult.features?.some((f: any) => 
          f.place_name?.toLowerCase().includes('bulgaria')
        ) || false,
        timestamp: new Date().toISOString(),
        status: '🟢 ALL_SYSTEMS_OPERATIONAL'
      });
      
      console.log('🎉 [SUCCESS] Все тесты пройдены успешно!');
      
    } catch (err) {
      console.error('💥 [ERROR] Критическая ошибка:', err);
      setError(`Критическая ошибка: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
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