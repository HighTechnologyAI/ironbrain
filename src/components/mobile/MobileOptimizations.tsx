import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileFeatures } from '@/hooks/use-mobile-features';
import { Smartphone, Wifi, Battery, Signal, Vibrate, Camera } from 'lucide-react';

export const MobileOptimizations: React.FC = () => {
  const isMobile = useIsMobile();
  const { triggerHapticFeedback } = useMobileFeatures();
  
  // Mock data for demo purposes
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  
  const networkInfo = {
    online: navigator.onLine,
    effectiveType: '4g' as '4g' | '3g' | '2g'
  };
  
  const deviceInfo = {
    platform: navigator.platform,
    userAgent: navigator.userAgent
  };
  
  const capabilities = {
    camera: 'mediaDevices' in navigator,
    geolocation: 'geolocation' in navigator,
    notifications: 'Notification' in window,
    vibration: 'vibrate' in navigator,
    share: 'share' in navigator
  };
  
  const [batteryInfo, setBatteryInfo] = useState<any>(null);

  useEffect(() => {
    // Get battery information if available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryInfo({
          level: Math.round(battery.level * 100),
          charging: battery.charging,
          dischargingTime: battery.dischargingTime,
          chargingTime: battery.chargingTime
        });

        // Listen for battery events
        battery.addEventListener('levelchange', () => {
          setBatteryInfo((prev: any) => ({
            ...prev,
            level: Math.round(battery.level * 100)
          }));
        });

        battery.addEventListener('chargingchange', () => {
          setBatteryInfo((prev: any) => ({
            ...prev,
            charging: battery.charging
          }));
        });
      });
    }
  }, []);

  const handleVibrate = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]); // Pattern: vibrate 200ms, pause 100ms, vibrate 200ms
    } else {
      triggerHapticFeedback('medium');
    }
  };

  const handleShare = async () => {
    if ('share' in navigator) {
      await navigator.share({
        title: 'Tiger CRM',
        text: 'Check out this amazing CRM system!',
        url: window.location.href
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
  };

  const getNetworkBadgeVariant = (effectiveType: string) => {
    switch (effectiveType) {
      case '4g':
        return 'default';
      case '3g':
        return 'secondary';
      case '2g':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (!isMobile && !isTablet) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Mobile optimizations are available on mobile devices</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mobile Dashboard</h2>
          <p className="text-muted-foreground">
            Device information and mobile-specific features
          </p>
        </div>
        <Badge variant="outline">
          {isMobile ? 'Mobile' : 'Tablet'} • {orientation}
        </Badge>
      </div>

      {/* Device Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Network Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network</CardTitle>
            <Signal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={getNetworkBadgeVariant(networkInfo.effectiveType)}>
                {networkInfo.effectiveType?.toUpperCase() || 'Unknown'}
              </Badge>
              {networkInfo.online ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <Wifi className="h-4 w-4 text-red-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {networkInfo.online ? 'Connected' : 'Offline'}
            </p>
          </CardContent>
        </Card>

        {/* Battery Status */}
        {batteryInfo && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Battery</CardTitle>
              <Battery className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{batteryInfo.level}%</div>
              <div className="flex items-center space-x-1">
                <div className={`w-full bg-muted rounded-full h-2`}>
                  <div 
                    className={`h-2 rounded-full ${
                      batteryInfo.level > 20 ? 'bg-green-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${batteryInfo.level}%` }}
                  />
                </div>
                {batteryInfo.charging && (
                  <span className="text-xs text-green-600">⚡</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Device Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Device</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div>{deviceInfo.platform}</div>
              <div className="text-muted-foreground">
                {deviceInfo.userAgent.split(' ')[0]}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Capabilities */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Features</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {capabilities.camera && <Badge variant="outline" className="text-xs">Camera</Badge>}
              {capabilities.geolocation && <Badge variant="outline" className="text-xs">GPS</Badge>}
              {capabilities.notifications && <Badge variant="outline" className="text-xs">Push</Badge>}
              {capabilities.vibration && <Badge variant="outline" className="text-xs">Vibrate</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Mobile Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={handleVibrate}
              disabled={!capabilities.vibration}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Vibrate className="h-4 w-4" />
              <span>Test Vibration</span>
            </Button>

            <Button 
              onClick={handleShare}
              disabled={!capabilities.share}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Smartphone className="h-4 w-4" />
              <span>Share App</span>
            </Button>

            <Button 
              onClick={requestNotificationPermission}
              disabled={!capabilities.notifications}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Signal className="h-4 w-4" />
              <span>Enable Notifications</span>
            </Button>

            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Wifi className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {networkInfo.effectiveType === '2g' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Slow connection detected:</strong> Some features may load slower. 
                  Consider using offline mode when available.
                </p>
              </div>
            )}
            
            {batteryInfo && batteryInfo.level < 20 && !batteryInfo.charging && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Low battery:</strong> Enable power saving mode to extend battery life.
                </p>
              </div>
            )}
            
            {!networkInfo.online && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Offline mode:</strong> You can still view cached content and make changes 
                  that will sync when connection is restored.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PWA Features */}
      <Card>
        <CardHeader>
          <CardTitle>Progressive Web App</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Add to Home Screen</span>
              <Button variant="outline" size="sm">
                Install
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Offline Support</span>
              <Badge variant="default">Enabled</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Background Sync</span>
              <Badge variant="default">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Push Notifications</span>
              <Badge variant={capabilities.notifications ? "default" : "secondary"}>
                {capabilities.notifications ? "Available" : "Not Available"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};