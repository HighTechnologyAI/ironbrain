import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGamepad } from '@/hooks/use-gamepad';
import { 
  Gamepad2, 
  Radio, 
  Settings, 
  Wifi, 
  WifiOff,
  Target,
  Plane,
  RotateCcw
} from 'lucide-react';

interface GamepadControllerProps {
  onControlChange?: (controls: {
    throttle: number;
    rudder: number;
    elevator: number;
    aileron: number;
  }) => void;
  onCommand?: (command: string) => void;
}

export default function GamepadController({ onControlChange, onCommand }: GamepadControllerProps) {
  const { 
    gamepads, 
    selectedGamepad, 
    setSelectedGamepad,
    getControlValues,
    isButtonPressed,
    calibrateController,
    isCalibrating
  } = useGamepad();

  const [controlValues, setControlValues] = useState({
    throttle: 0,
    rudder: 0, 
    elevator: 0,
    aileron: 0
  });

  // Update control values and trigger callbacks
  useEffect(() => {
    if (selectedGamepad !== null) {
      const values = getControlValues(selectedGamepad);
      if (values) {
        setControlValues(values);
        onControlChange?.(values);
      }

      // Check button presses
      if (isButtonPressed(selectedGamepad, 0)) { // A button - ARM
        onCommand?.('ARM');
      }
      if (isButtonPressed(selectedGamepad, 1)) { // B button - DISARM  
        onCommand?.('DISARM');
      }
      if (isButtonPressed(selectedGamepad, 3)) { // Y button - RTL
        onCommand?.('RTL');
      }
    }
  }, [selectedGamepad, getControlValues, isButtonPressed, onControlChange, onCommand]);

  const getControllerTypeIcon = (id: string) => {
    if (id.toLowerCase().includes('radiomaster') || id.toLowerCase().includes('tx16')) {
      return <Radio className="w-4 h-4" />;
    }
    if (id.toLowerCase().includes('skydroid')) {
      return <Target className="w-4 h-4" />;
    }
    return <Gamepad2 className="w-4 h-4" />;
  };

  const formatControlValue = (value: number): string => {
    return (value * 100).toFixed(1) + '%';
  };

  const getThrottleColor = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue > 0.8) return 'text-red-500';
    if (absValue > 0.5) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="space-y-4">
      {/* Controller Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            Flight Controller
            {selectedGamepad !== null && (
              <Badge variant="default" className="ml-auto">
                <Wifi className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gamepads.length === 0 ? (
            <div className="text-center py-8">
              <WifiOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Controllers Detected</h3>
              <p className="text-muted-foreground text-sm">
                Connect your RadioMaster TX16 or SkyDroid controller via USB
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {gamepads.map((gamepad, index) => (
                <div 
                  key={gamepad.index}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedGamepad === index ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                  }`}
                  onClick={() => setSelectedGamepad(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getControllerTypeIcon(gamepad.id)}
                      <div>
                        <h4 className="font-medium">{gamepad.id}</h4>
                        <p className="text-sm text-muted-foreground">
                          Index: {gamepad.index} | Axes: {gamepad.axes.length} | Buttons: {gamepad.buttons.length}
                        </p>
                      </div>
                    </div>
                    {gamepad.connected ? (
                      <Badge variant="default">Connected</Badge>
                    ) : (
                      <Badge variant="destructive">Disconnected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Control Values */}
      {selectedGamepad !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Plane className="w-5 h-5" />
                Flight Controls
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={calibrateController}
                disabled={isCalibrating}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                {isCalibrating ? 'Calibrating...' : 'Calibrate'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {/* Throttle */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Throttle</span>
                  <span className={`text-sm font-mono ${getThrottleColor(controlValues.throttle)}`}>
                    {formatControlValue(controlValues.throttle)}
                  </span>
                </div>
                <Progress 
                  value={((controlValues.throttle + 1) / 2) * 100} 
                  className="h-2"
                />
              </div>

              {/* Rudder */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Rudder</span>
                  <span className="text-sm font-mono">
                    {formatControlValue(controlValues.rudder)}
                  </span>
                </div>
                <Progress 
                  value={((controlValues.rudder + 1) / 2) * 100} 
                  className="h-2"
                />
              </div>

              {/* Elevator */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Elevator</span>
                  <span className="text-sm font-mono">
                    {formatControlValue(controlValues.elevator)}
                  </span>
                </div>
                <Progress 
                  value={((controlValues.elevator + 1) / 2) * 100} 
                  className="h-2"
                />
              </div>

              {/* Aileron */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Aileron</span>
                  <span className="text-sm font-mono">
                    {formatControlValue(controlValues.aileron)}
                  </span>
                </div>
                <Progress 
                  value={((controlValues.aileron + 1) / 2) * 100} 
                  className="h-2"
                />
              </div>
            </div>

            {/* Quick Commands */}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Quick Commands:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>🎮 A Button - ARM</div>
                <div>🎮 B Button - DISARM</div>
                <div>🎮 X Button - Mode Change</div>
                <div>🎮 Y Button - Return to Launch</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}