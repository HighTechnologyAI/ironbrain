import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Wifi, WifiOff, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScanResult {
  ip: string;
  port: number;
  status: 'jetson' | 'unknown' | 'timeout';
  response?: any;
  responseTime?: number;
}

interface JetsonNetworkScannerProps {
  onJetsonFound?: (ip: string, port: number, response: any) => void;
}

export function JetsonNetworkScanner({ onJetsonFound }: JetsonNetworkScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [subnet, setSubnet] = useState('192.168.1.1');
  const [results, setResults] = useState<ScanResult[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const { toast } = useToast();

  const scanNetwork = async () => {
    setIsScanning(true);
    setResults([]);
    setSummary(null);

    try {
      toast({
        title: "🔍 Сканирование сети",
        description: `Поиск Jetson устройств в подсети ${subnet.split('.').slice(0, 3).join('.')}.0/24`,
      });

      const { data, error } = await supabase.functions.invoke('jetson-network-scanner', {
        body: {
          action: 'scan',
          subnet: subnet
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        setResults(data.allResults || []);
        setSummary(data.summary);

        if (data.jetsonDevices && data.jetsonDevices.length > 0) {
          toast({
            title: "✅ Jetson найден!",
            description: `Обнаружено ${data.jetsonDevices.length} Jetson устройств`,
          });

          // Auto-select first found Jetson
          const firstJetson = data.jetsonDevices[0];
          if (onJetsonFound) {
            onJetsonFound(firstJetson.ip, firstJetson.port, firstJetson.response);
          }
        } else {
          toast({
            title: "❌ Jetson не найден",
            description: "Не удалось найти Jetson устройства в сети",
            variant: "destructive"
          });
        }
      } else {
        throw new Error(data.error || 'Scan failed');
      }

    } catch (error) {
      console.error('Network scan error:', error);
      toast({
        title: "❌ Ошибка сканирования",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const pingSpecificIP = async (ip: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('jetson-network-scanner', {
        body: {
          action: 'ping',
          ip: ip,
          port: 5000
        }
      });

      if (error) throw new Error(error.message);

      if (data.success && data.result.status === 'jetson') {
        toast({
          title: "✅ Jetson подтвержден",
          description: `${ip}:5000 - активное Jetson устройство`,
        });
        
        if (onJetsonFound) {
          onJetsonFound(data.result.ip, data.result.port, data.result.response);
        }
      } else {
        toast({
          title: "❌ Не Jetson",
          description: `${ip}:5000 не отвечает или не является Jetson`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "❌ Ошибка ping",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'jetson':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unknown':
        return <Wifi className="h-4 w-4 text-yellow-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'jetson':
        return <Badge className="bg-green-500">Jetson GCS</Badge>;
      case 'unknown':
        return <Badge variant="secondary">Unknown Device</Badge>;
      default:
        return <Badge variant="outline">No Response</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Сетевой сканер Jetson
        </CardTitle>
        <CardDescription>
          Автоматический поиск Jetson устройств в локальной сети
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="subnet">Подсеть для сканирования</Label>
            <Input
              id="subnet"
              value={subnet}
              onChange={(e) => setSubnet(e.target.value)}
              placeholder="192.168.1.1"
              disabled={isScanning}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Введите любой IP из целевой подсети
            </p>
          </div>
          
          <Button 
            onClick={scanNetwork} 
            disabled={isScanning}
            className="min-w-[120px]"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Сканирую...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Сканировать
              </>
            )}
          </Button>
        </div>

        {summary && (
          <div className="bg-secondary/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">📊 Результаты сканирования</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Всего проверено:</span>
                <div className="font-semibold">{summary.totalScanned}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Ответили:</span>
                <div className="font-semibold">{summary.responding}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Jetson найдено:</span>
                <div className="font-semibold text-green-600">{summary.jetsonFound}</div>
              </div>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">🖥️ Обнаруженные устройства</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results
                .filter(result => result.status !== 'timeout')
                .sort((a, b) => {
                  if (a.status === 'jetson' && b.status !== 'jetson') return -1;
                  if (a.status !== 'jetson' && b.status === 'jetson') return 1;
                  return 0;
                })
                .map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/30"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-mono text-sm font-semibold">
                          {result.ip}:{result.port}
                        </div>
                        {result.response && (
                          <div className="text-xs text-muted-foreground">
                            {result.response.service} v{result.response.version}
                            {result.response.platform && ` • ${result.response.platform}`}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(result.status)}
                      {result.responseTime && (
                        <span className="text-xs text-muted-foreground">
                          {result.responseTime}ms
                        </span>
                      )}
                      {result.status === 'jetson' && (
                        <Button
                          size="sm"
                          onClick={() => onJetsonFound?.(result.ip, result.port, result.response)}
                        >
                          Использовать
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h5 className="font-semibold text-blue-900 mb-1">💡 Быстрые варианты</h5>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline" 
              size="sm"
              onClick={() => pingSpecificIP('192.168.1.236')}
              disabled={isScanning}
            >
              Проверить 192.168.1.236
            </Button>
            <Button
              variant="outline" 
              size="sm"
              onClick={() => pingSpecificIP('jetson.local')}
              disabled={isScanning}
            >
              Проверить jetson.local
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}