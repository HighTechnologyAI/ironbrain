import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Gamepad2, 
  Send, 
  AlertTriangle, 
  Plane, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  RotateCw,
  RotateCcw,
  Navigation,
  Battery,
  Gauge,
  Home,
  Square,
  Play,
  Pause
} from 'lucide-react';
import { VPSService } from '@/services/vpsService';
import { useJetsonConnections } from '@/hooks/use-jetson-connections';

interface DroneControlState {
  armed: boolean;
  mode: string;
  altitude: number;
  battery: number;
  gps: boolean;
  velocity: { x: number; y: number; z: number };
}

export function ManualDroneControl() {
  const { connections, activeConnection, sendCommand } = useJetsonConnections();
  const [droneState, setDroneState] = useState<DroneControlState>({
    armed: false,
    mode: 'UNKNOWN',
    altitude: 0,
    battery: 0,
    gps: false,
    velocity: { x: 0, y: 0, z: 0 }
  });
  
  const [controlValues, setControlValues] = useState({
    throttle: 50,
    yaw: 0,
    pitch: 0,
    roll: 0
  });
  
  const [isControlling, setIsControlling] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');

  const activeConn = connections.find(c => c.id === activeConnection);

  const sendDroneCommand = async (command: string, params?: any) => {
    if (!activeConnection) {
      alert('No active drone connection');
      return;
    }

    setIsControlling(true);
    setLastCommand(`${command}${params ? ` (${JSON.stringify(params)})` : ''}`);
    
    try {
      // Try Jetson first
      if (activeConn) {
        await sendCommand(activeConnection, command, params);
      }
      
      // Also send via VPS if available
      await VPSService.sendDroneCommand(command, params);
      
      console.log(`Command sent: ${command}`, params);
    } catch (error) {
      console.error('Command failed:', error);
      alert(`Command failed: ${error}`);
    } finally {
      setIsControlling(false);
    }
  };

  const handleArm = () => sendDroneCommand('ARM');
  const handleDisarm = () => sendDroneCommand('DISARM');
  const handleTakeoff = () => sendDroneCommand('TAKEOFF', { altitude: 10 });
  const handleLand = () => sendDroneCommand('LAND');
  const handleRTL = () => sendDroneCommand('RTL');

  const handleModeChange = (mode: string) => sendDroneCommand('SET_MODE', { mode });

  const handleMovement = (direction: string, distance: number = 5) => {
    const movements = {
      forward: { x: distance, y: 0, z: 0 },
      backward: { x: -distance, y: 0, z: 0 },
      left: { x: 0, y: -distance, z: 0 },
      right: { x: 0, y: distance, z: 0 },
      up: { x: 0, y: 0, z: distance },
      down: { x: 0, y: 0, z: -distance },
    };
    
    if (movements[direction as keyof typeof movements]) {
      sendDroneCommand('MOVE_LOCAL', movements[direction as keyof typeof movements]);
    }
  };

  const handleRotation = (yaw: number) => {
    sendDroneCommand('SET_YAW', { yaw });
  };

  // Gamepad support
  useEffect(() => {
    let gamepadIndex: number | null = null;
    
    const checkGamepads = () => {
      const gamepads = navigator.getGamepads();
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          gamepadIndex = i;
          break;
        }
      }
    };

    const handleGamepadInput = () => {
      if (gamepadIndex === null) return;
      
      const gamepad = navigator.getGamepads()[gamepadIndex];
      if (!gamepad) return;

      // Basic gamepad mapping (may need adjustment for specific controllers)
      const throttle = Math.round((1 - gamepad.axes[1]) * 50); // Left stick Y
      const yaw = Math.round(gamepad.axes[0] * 100); // Left stick X
      const pitch = Math.round(gamepad.axes[3] * 100); // Right stick Y
      const roll = Math.round(gamepad.axes[2] * 100); // Right stick X

      setControlValues({ throttle, yaw, pitch, roll });

      // Button mappings
      if (gamepad.buttons[0]?.pressed) handleArm(); // A button
      if (gamepad.buttons[1]?.pressed) handleDisarm(); // B button
      if (gamepad.buttons[2]?.pressed) handleTakeoff(); // X button
      if (gamepad.buttons[3]?.pressed) handleLand(); // Y button
    };

    checkGamepads();
    const interval = setInterval(handleGamepadInput, 100);
    
    return () => clearInterval(interval);
  }, [activeConnection]);

  return (
    <div className="space-y-6">
      {/* Status Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plane className="h-5 w-5" />
            <span>Drone Status</span>
            {activeConn && (
              <Badge variant={activeConn.status === 'connected' ? 'default' : 'destructive'}>
                {activeConn.name}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!activeConnection ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No active drone connection. Please connect to a drone first.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Badge variant={droneState.armed ? 'destructive' : 'secondary'}>
                  {droneState.armed ? 'ARMED' : 'DISARMED'}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Mode:</span>
                <Badge variant="outline">{droneState.mode}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Battery className="h-4 w-4" />
                <span className="text-sm">{droneState.battery}%</span>
              </div>
              <div className="flex items-center space-x-2">
                <Gauge className="h-4 w-4" />
                <span className="text-sm">{droneState.altitude.toFixed(1)}m</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Controls</CardTitle>
            <CardDescription>
              Arm, disarm, takeoff, land operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={handleArm}
                disabled={!activeConnection || droneState.armed || isControlling}
                variant="destructive"
                className="h-12"
              >
                <Play className="h-4 w-4 mr-2" />
                ARM
              </Button>
              <Button 
                onClick={handleDisarm}
                disabled={!activeConnection || !droneState.armed || isControlling}
                variant="outline"
                className="h-12"
              >
                <Pause className="h-4 w-4 mr-2" />
                DISARM
              </Button>
              <Button 
                onClick={handleTakeoff}
                disabled={!activeConnection || !droneState.armed || isControlling}
                className="h-12"
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                TAKEOFF
              </Button>
              <Button 
                onClick={handleLand}
                disabled={!activeConnection || isControlling}
                variant="secondary"
                className="h-12"
              >
                <ArrowDown className="h-4 w-4 mr-2" />
                LAND
              </Button>
            </div>
            
            <Button 
              onClick={handleRTL}
              disabled={!activeConnection || isControlling}
              variant="outline"
              className="w-full h-12"
            >
              <Home className="h-4 w-4 mr-2" />
              RETURN TO LAUNCH
            </Button>

            {lastCommand && (
              <Alert>
                <Send className="h-4 w-4" />
                <AlertDescription>
                  Last command: {lastCommand}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Movement Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Movement Controls</CardTitle>
            <CardDescription>
              Directional movement and positioning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Directional Pad */}
            <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
              <div></div>
              <Button 
                onClick={() => handleMovement('forward')}
                disabled={!activeConnection || isControlling}
                variant="outline"
                className="aspect-square"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <div></div>
              
              <Button 
                onClick={() => handleMovement('left')}
                disabled={!activeConnection || isControlling}
                variant="outline"
                className="aspect-square"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => handleMovement('up')}
                disabled={!activeConnection || isControlling}
                variant="default"
                className="aspect-square"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => handleMovement('right')}
                disabled={!activeConnection || isControlling}
                variant="outline"
                className="aspect-square"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <div></div>
              <Button 
                onClick={() => handleMovement('backward')}
                disabled={!activeConnection || isControlling}
                variant="outline"
                className="aspect-square"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button 
                onClick={() => handleMovement('down')}
                disabled={!activeConnection || isControlling}
                variant="secondary"
                className="aspect-square"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Rotation Controls */}
            <div className="flex justify-center space-x-2">
              <Button 
                onClick={() => handleRotation(-30)}
                disabled={!activeConnection || isControlling}
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Left 30°
              </Button>
              <Button 
                onClick={() => handleRotation(30)}
                disabled={!activeConnection || isControlling}
                variant="outline"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Right 30°
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gamepad Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gamepad2 className="h-5 w-5" />
            <span>Gamepad / SkyDroid H16 Controls</span>
          </CardTitle>
          <CardDescription>
            Real-time control values from connected gamepad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Throttle</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[controlValues.throttle]}
                  onValueChange={([value]) => setControlValues(prev => ({ ...prev, throttle: value }))}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm w-8">{controlValues.throttle}</span>
              </div>
            </div>
            
            <div>
              <Label>Yaw</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[controlValues.yaw + 100]}
                  onValueChange={([value]) => setControlValues(prev => ({ ...prev, yaw: value - 100 }))}
                  max={200}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm w-8">{controlValues.yaw}</span>
              </div>
            </div>
            
            <div>
              <Label>Pitch</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[controlValues.pitch + 100]}
                  onValueChange={([value]) => setControlValues(prev => ({ ...prev, pitch: value - 100 }))}
                  max={200}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm w-8">{controlValues.pitch}</span>
              </div>
            </div>
            
            <div>
              <Label>Roll</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  value={[controlValues.roll + 100]}
                  onValueChange={([value]) => setControlValues(prev => ({ ...prev, roll: value - 100 }))}
                  max={200}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm w-8">{controlValues.roll}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <Badge variant="secondary">
              Connect SkyDroid H16 via USB for direct control
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Flight Modes */}
      <Card>
        <CardHeader>
          <CardTitle>Flight Modes</CardTitle>
          <CardDescription>
            Change drone flight mode for different behaviors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['STABILIZE', 'ALT_HOLD', 'LOITER', 'GUIDED', 'AUTO', 'RTL', 'LAND'].map((mode) => (
              <Button
                key={mode}
                onClick={() => handleModeChange(mode)}
                disabled={!activeConnection || isControlling}
                variant={droneState.mode === mode ? 'default' : 'outline'}
                className="h-10"
              >
                {mode}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}