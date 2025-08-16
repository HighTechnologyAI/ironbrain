import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDroneConnections } from '@/hooks/use-drone-connections';
import { 
  Wifi, 
  WifiOff, 
  Plus, 
  Trash2, 
  Search, 
  Radio,
  Loader2,
  Activity,
  AlertCircle,
  CheckCircle,
  Plane
} from 'lucide-react';
import { toast } from 'sonner';

export default function DroneConnectionManager() {
  const { 
    connections, 
    activeConnection,
    addDroneConnection,
    removeDroneConnection,
    connectToDrone,
    disconnectFromDrone,
    discoverDrones
  } = useDroneConnections();

  const [showAddForm, setShowAddForm] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [newDrone, setNewDrone] = useState({
    name: '',
    ip: '',
    port: 5000,
    protocol: 'tcp' as 'tcp' | 'udp'
  });

  const handleAddDrone = () => {
    if (!newDrone.name || !newDrone.ip) {
      toast.error('Please fill in all required fields');
      return;
    }

    const droneId = addDroneConnection({
      id: `drone_${Date.now()}`,
      name: newDrone.name,
      ip: newDrone.ip,
      port: newDrone.port,
      protocol: newDrone.protocol
    });

    toast.success(`Added drone: ${newDrone.name}`);
    setNewDrone({ name: '', ip: '', port: 5000, protocol: 'tcp' });
    setShowAddForm(false);

    // Auto-connect to new drone
    setTimeout(() => connectToDrone(droneId), 1000);
  };

  const handleDiscoverDrones = async () => {
    setIsDiscovering(true);
    try {
      const discovered = await discoverDrones();
      
      if (discovered.length === 0) {
        toast.info('No drones found on network');
      } else {
        discovered.forEach(drone => {
          addDroneConnection(drone);
        });
        toast.success(`Discovered ${discovered.length} drone(s)`);
      }
    } catch (error) {
      toast.error('Failed to discover drones');
    } finally {
      setIsDiscovering(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'connecting': return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'connecting': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Radio className="w-5 h-5" />
              Drone Connections
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscoverDrones}
                disabled={isDiscovering}
              >
                {isDiscovering ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-1" />
                )}
                Discover
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Drone
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add Drone Form */}
          {showAddForm && (
            <div className="p-4 border rounded-lg mb-4 bg-muted/50">
              <h4 className="font-medium mb-3">Add New Drone</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="drone-name">Drone Name</Label>
                  <Input
                    id="drone-name"
                    placeholder="Tiger-001"
                    value={newDrone.name}
                    onChange={(e) => setNewDrone(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="drone-ip">IP Address</Label>
                  <Input
                    id="drone-ip"
                    placeholder="192.168.1.100"
                    value={newDrone.ip}
                    onChange={(e) => setNewDrone(prev => ({ ...prev, ip: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="drone-port">Port</Label>
                  <Input
                    id="drone-port"
                    type="number"
                    value={newDrone.port}
                    onChange={(e) => setNewDrone(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="drone-protocol">Protocol</Label>
                  <Select 
                    value={newDrone.protocol} 
                    onValueChange={(value: 'tcp' | 'udp') => setNewDrone(prev => ({ ...prev, protocol: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tcp">TCP</SelectItem>
                      <SelectItem value="udp">UDP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button onClick={handleAddDrone}>Add Drone</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Drone List */}
          {connections.length === 0 ? (
            <div className="text-center py-8">
              <Plane className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Drones Configured</h3>
              <p className="text-muted-foreground text-sm">
                Add your first drone connection or use the discover feature
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map((drone) => (
                <div 
                  key={drone.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    activeConnection === drone.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(drone.status)}
                      <div>
                        <h4 className="font-medium">{drone.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {drone.ip}:{drone.port} ({drone.protocol.toUpperCase()})
                        </p>
                        {drone.jetsonInfo && (
                          <p className="text-xs text-muted-foreground">
                            {drone.jetsonInfo.model} - v{drone.jetsonInfo.version}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(drone.status) as any}>
                        {drone.status}
                      </Badge>
                      
                      {drone.status === 'connected' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectFromDrone(drone.id)}
                        >
                          <WifiOff className="w-4 h-4 mr-1" />
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => connectToDrone(drone.id)}
                          disabled={drone.status === 'connecting'}
                        >
                          <Wifi className="w-4 h-4 mr-1" />
                          Connect
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeDroneConnection(drone.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Telemetry Preview */}
                  {drone.status === 'connected' && drone.telemetry && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Battery:</span>
                          <div className="font-mono">
                            {drone.telemetry.battery_voltage?.toFixed(1)}V ({drone.telemetry.battery_remaining}%)
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mode:</span>
                          <div className="font-mono">{drone.telemetry.mode}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">GPS:</span>
                          <div className="font-mono">{drone.telemetry.gps_satellites} sats</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Armed:</span>
                          <div className="font-mono">
                            {drone.telemetry.armed ? (
                              <Badge variant="destructive" className="text-xs">ARMED</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">DISARMED</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Connection Info */}
      {activeConnection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Active Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const active = connections.find(c => c.id === activeConnection);
              return active ? (
                <div>
                  <h4 className="font-medium">{active.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Connected to {active.ip}:{active.port}
                  </p>
                  {active.lastSeen && (
                    <p className="text-xs text-muted-foreground">
                      Last seen: {new Date(active.lastSeen).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No active connection</p>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}