import { useState, useEffect, useCallback, useRef } from 'react';

export interface GamepadState {
  connected: boolean;
  id: string;
  index: number;
  axes: number[];
  buttons: GamepadButton[];
  timestamp: number;
}

export interface ControllerMapping {
  throttle: number;    // Left stick Y
  rudder: number;      // Left stick X  
  elevator: number;    // Right stick Y
  aileron: number;     // Right stick X
  arm: number;         // Button A
  disarm: number;      // Button B
  mode: number;        // Button X
  rtl: number;         // Button Y
}

// Default mapping for RadioMaster TX16 / SkyDroid
const DEFAULT_MAPPING: ControllerMapping = {
  throttle: 1,   // Left stick Y
  rudder: 0,     // Left stick X
  elevator: 3,   // Right stick Y  
  aileron: 2,    // Right stick X
  arm: 0,        // Button A
  disarm: 1,     // Button B
  mode: 2,       // Button X
  rtl: 3         // Button Y
};

export function useGamepad() {
  const [gamepads, setGamepads] = useState<GamepadState[]>([]);
  const [selectedGamepad, setSelectedGamepad] = useState<number | null>(null);
  const [mapping, setMapping] = useState<ControllerMapping>(DEFAULT_MAPPING);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const pollRef = useRef<number>();

  // Deadzone for stick centering
  const DEADZONE = 0.1;

  const applyDeadzone = useCallback((value: number): number => {
    return Math.abs(value) < DEADZONE ? 0 : value;
  }, []);

  const pollGamepads = useCallback(() => {
    const gamepadList = navigator.getGamepads();
    const connectedGamepads: GamepadState[] = [];

    for (let i = 0; i < gamepadList.length; i++) {
      const gamepad = gamepadList[i];
      if (gamepad) {
        connectedGamepads.push({
          connected: gamepad.connected,
          id: gamepad.id,
          index: gamepad.index,
          axes: gamepad.axes.map(applyDeadzone),
          buttons: Array.from(gamepad.buttons),
          timestamp: gamepad.timestamp
        });
      }
    }

    setGamepads(connectedGamepads);
  }, [applyDeadzone]);

  useEffect(() => {
    const handleGamepadConnect = (e: GamepadEvent) => {
      console.log(`🎮 Gamepad connected: ${e.gamepad.id}`);
      pollGamepads();
    };

    const handleGamepadDisconnect = (e: GamepadEvent) => {
      console.log(`🎮 Gamepad disconnected: ${e.gamepad.id}`);
      pollGamepads();
    };

    window.addEventListener('gamepadconnected', handleGamepadConnect);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnect);

    // Start polling
    const poll = () => {
      pollGamepads();
      pollRef.current = requestAnimationFrame(poll);
    };
    poll();

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnect);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnect);
      if (pollRef.current) {
        cancelAnimationFrame(pollRef.current);
      }
    };
  }, [pollGamepads]);

  const getControlValues = useCallback((gamepadIndex: number = 0): {
    throttle: number;
    rudder: number;
    elevator: number;
    aileron: number;
  } | null => {
    const gamepad = gamepads[gamepadIndex];
    if (!gamepad || !gamepad.connected) return null;

    return {
      throttle: gamepad.axes[mapping.throttle] || 0,
      rudder: gamepad.axes[mapping.rudder] || 0,
      elevator: gamepad.axes[mapping.elevator] || 0,
      aileron: gamepad.axes[mapping.aileron] || 0
    };
  }, [gamepads, mapping]);

  const isButtonPressed = useCallback((gamepadIndex: number, buttonIndex: number): boolean => {
    const gamepad = gamepads[gamepadIndex];
    return gamepad?.buttons[buttonIndex]?.pressed || false;
  }, [gamepads]);

  const calibrateController = useCallback(() => {
    setIsCalibrating(true);
    // Calibration logic here
    setTimeout(() => setIsCalibrating(false), 5000);
  }, []);

  return {
    gamepads,
    selectedGamepad,
    setSelectedGamepad,
    mapping,
    setMapping,
    isCalibrating,
    getControlValues,
    isButtonPressed,
    calibrateController
  };
}