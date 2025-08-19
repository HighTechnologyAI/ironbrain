import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useJetsonConnections, JetsonConnection } from '@/hooks/use-jetson-connections';
import { 
  Plus, 
  Wifi, 
  WifiOff, 
  Activity, 
  Trash2, 
  Settings, 
  Battery,
  Signal,
  MapPin,
  Plane,
  Thermometer,
  Zap
} from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';

const JetsonConnectionManager: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const {
    connections,
    activeConnection,
    addJetsonConnection,
    removeJetsonConnection,
    connectToJetson,
    disconnectFromJetson,
    sendCommand,
    getActiveConnection
  } = useJetsonConnections();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newJetson, setNewJetson] = useState({
    name: '',
    ip: '192.168.1.236',
    port: 5000
  });

  const handleAddJetson = () => {
    if (!newJetson.name || !newJetson.ip) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive"
      });
      return;
    }

    const id = addJetsonConnection({
      id: `jetson-${Date.now()}`,
      name: newJetson.name,
      ip: newJetson.ip,
      port: newJetson.port
    });

    setNewJetson({ name: '', ip: '192.168.1.236', port: 5000 });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Jetson добавлен",
      description: `${newJetson.name} добавлен в список подключений`
    });
  };

  const handleConnect = async (jetsonId: string) => {
    try {
      const success = await connectToJetson(jetsonId);
      if (success) {
        toast({
          title: "Подключение установлено",
          description: "Успешно подключились к Jetson"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка подключения",
        description: "Не удалось подключиться к Jetson",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = async (jetsonId: string) => {
    await disconnectFromJetson(jetsonId);
    toast({
      title: "Отключено",
      description: "Jetson отключен"
    });
  };

  const handleCommand = async (command: string) => {
    const activeConn = getActiveConnection();
    if (!activeConn) {
      toast({
        title: "Нет подключения",
        description: "Сначала подключитесь к Jetson",
        variant: "destructive"
      });
      return;
    }

    try {
      await sendCommand(activeConn.id, command);
      toast({
        title: "Команда отправлена",
        description: `Команда ${command} выполнена`
      });
    } catch (error) {
      toast({
        title: "Ошибка команды",
        description: `Не удалось выполнить команду ${command}`,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: JetsonConnection['status']) => {
    const variants = {
      connected: 'default',
      connecting: 'secondary',
      disconnected: 'outline',
      error: 'destructive'
    } as const;

    const labels = {
      connected: 'Подключен',
      connecting: 'Подключение...',
      disconnected: 'Отключен',
      error: 'Ошибка'
    };

    return (
      <Badge variant={variants[status]} className="flex items-center gap-1">
        {status === 'connected' && <Wifi className="w-3 h-3" />}
        {status === 'disconnected' && <WifiOff className="w-3 h-3" />}
        {status === 'connecting' && <Activity className="w-3 h-3 animate-pulse" />}
        {status === 'error' && <WifiOff className="w-3 h-3" />}
        {labels[status]}
      </Badge>
    );
  };

  const activeConn = getActiveConnection();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Jetson Connections</h2>
          <p className="text-muted-foreground">Управление подключениями к Jetson Nano</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить Jetson
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить Jetson Nano</DialogTitle>
              <DialogDescription>
                Добавьте новое подключение к Jetson Nano с jetson_soft
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={newJetson.name}
                  onChange={(e) => setNewJetson(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="TIGER-Jetson-001"
                />
              </div>
              <div>
                <Label htmlFor="ip">IP адрес</Label>
                <Input
                  id="ip"
                  value={newJetson.ip}
                  onChange={(e) => setNewJetson(prev => ({ ...prev, ip: e.target.value }))}
                  placeholder="192.168.1.236"
                />
              </div>
              <div>
                <Label htmlFor="port">Порт</Label>
                <Input
                  id="port"
                  type="number"
                  value={newJetson.port}
                  onChange={(e) => setNewJetson(prev => ({ ...prev, port: parseInt(e.target.value) || 5000 }))}
                  placeholder="5000"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleAddJetson}>
                  Добавить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Connections List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {connections.map((connection) => (
          <Card key={connection.id} className={`${activeConnection === connection.id ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{connection.name}</CardTitle>
                  <CardDescription>{connection.ip}:{connection.port}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(connection.status)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeJetsonConnection(connection.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Connection Controls */}
              <div className="flex gap-2">
                {connection.status === 'connected' ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDisconnect(connection.id)}
                    className="flex-1"
                  >
                    <WifiOff className="w-4 h-4 mr-2" />
                    Отключить
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => handleConnect(connection.id)}
                    disabled={connection.status === 'connecting'}
                    className="flex-1"
                  >
                    <Wifi className="w-4 h-4 mr-2" />
                    {connection.status === 'connecting' ? 'Подключение...' : 'Подключить'}
                  </Button>
                )}
              </div>

              {/* Telemetry Display */}
              {connection.status === 'connected' && connection.telemetry && (
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    {connection.telemetry.battery_level !== undefined && (
                      <div className="flex items-center gap-1">
                        <Battery className="w-4 h-4" />
                        <span>{Math.round(connection.telemetry.battery_level)}%</span>
                      </div>
                    )}
                    {connection.telemetry.armed !== undefined && (
                      <div className="flex items-center gap-1">
                        <Plane className="w-4 h-4" />
                        <span>{connection.telemetry.armed ? 'Armed' : 'Disarmed'}</span>
                      </div>
                    )}
                    {connection.telemetry.altitude_meters !== undefined && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{Math.round(connection.telemetry.altitude_meters)}m</span>
                      </div>
                    )}
                    {connection.telemetry.temperature_celsius !== undefined && (
                      <div className="flex items-center gap-1">
                        <Thermometer className="w-4 h-4" />
                        <span>{Math.round(connection.telemetry.temperature_celsius)}°C</span>
                      </div>
                    )}
                  </div>
                  
                  {connection.telemetry.flight_mode && (
                    <div className="text-center">
                      <Badge variant="secondary">{connection.telemetry.flight_mode}</Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Jetson Status */}
              {connection.jetsonStatus && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>CPU: {Math.round(connection.jetsonStatus.cpu_usage)}%</div>
                  <div>RAM: {Math.round(connection.jetsonStatus.memory_usage)}%</div>
                  <div>Uptime: {Math.round(connection.jetsonStatus.uptime / 60)}m</div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Connection Controls */}
      {activeConn && (
        <Card>
          <CardHeader>
            <CardTitle>Управление дроном: {activeConn.name}</CardTitle>
            <CardDescription>
              MAVLink: {activeConn.mavlinkConnected ? '✅ Подключен' : '❌ Отключен'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCommand('ARM')}
              >
                <Zap className="w-4 h-4 mr-2" />
                ARM
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCommand('DISARM')}
              >
                <WifiOff className="w-4 h-4 mr-2" />
                DISARM
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCommand('TAKEOFF')}
              >
                <Plane className="w-4 h-4 mr-2" />
                TAKEOFF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCommand('LAND')}
              >
                <MapPin className="w-4 h-4 mr-2" />
                LAND
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      {connections.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Wifi className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Добавьте подключение к Jetson Nano чтобы начать управление дроном</p>
        </div>
      )}
    </div>
  );
};

export default JetsonConnectionManager;