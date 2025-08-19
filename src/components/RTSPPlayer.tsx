import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Monitor,
  Wifi,
  WifiOff
} from 'lucide-react';

interface RTSPPlayerProps {
  droneId?: string;
  streamUrl?: string;
  className?: string;
  showControls?: boolean;
}

export const RTSPPlayer: React.FC<RTSPPlayerProps> = ({ 
  droneId, 
  streamUrl, 
  className = '',
  showControls = true 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [streamStatus, setStreamStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  // Simulate stream connection status
  useEffect(() => {
    if (streamUrl && droneId) {
      setStreamStatus('connecting');
      const timer = setTimeout(() => {
        // Simulate connection - in real implementation this would check actual stream
        setStreamStatus('connected');
        setIsConnected(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [streamUrl, droneId]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getStatusColor = () => {
    switch (streamStatus) {
      case 'connected': return 'default';
      case 'connecting': return 'secondary';
      case 'disconnected': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = () => {
    switch (streamStatus) {
      case 'connected': return <Wifi className="h-4 w-4" />;
      case 'connecting': return <Monitor className="h-4 w-4 animate-pulse" />;
      case 'disconnected': return <WifiOff className="h-4 w-4" />;
      default: return <WifiOff className="h-4 w-4" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Live Stream
            {droneId && (
              <span className="text-sm font-normal text-muted-foreground">
                ({droneId.slice(0, 8)}...)
              </span>
            )}
          </CardTitle>
          <Badge variant={getStatusColor()} className="flex items-center gap-1">
            {getStatusIcon()}
            {streamStatus}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Video Container */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden border">
          {streamStatus === 'connected' ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="text-center space-y-4">
                {isPlaying ? (
                  <div className="space-y-2">
                    <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-green-400 font-mono text-sm">LIVE FEED ACTIVE</p>
                    <p className="text-xs text-green-300">
                      {streamUrl || `rtsp://drone-${droneId?.slice(0, 8)}.local:8554/main`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Monitor className="w-16 h-16 text-slate-400 mx-auto" />
                    <p className="text-slate-400">Stream Ready</p>
                    <p className="text-xs text-slate-500">Click play to start</p>
                  </div>
                )}
              </div>
            </div>
          ) : streamStatus === 'connecting' ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-yellow-400">Connecting to stream...</p>
                <p className="text-xs text-slate-400">
                  {streamUrl || `rtsp://drone-${droneId?.slice(0, 8)}.local:8554/main`}
                </p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <div className="text-center space-y-4">
                <WifiOff className="w-16 h-16 text-red-400 mx-auto" />
                <p className="text-red-400">No Stream Available</p>
                <p className="text-xs text-slate-500">
                  Drone camera not connected
                </p>
              </div>
            </div>
          )}

          {/* Overlay Controls */}
          {showControls && streamStatus === 'connected' && (
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handlePlay}
                    className="text-white hover:bg-white/20"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleStop}
                    className="text-white hover:bg-white/20"
                  >
                    <Square className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Stream Info */}
        {streamStatus === 'connected' && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">Resolution:</span>
              <p className="font-mono">1920x1080</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Bitrate:</span>
              <p className="font-mono">2.5 Mbps</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">FPS:</span>
              <p className="font-mono">30</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Latency:</span>
              <p className="font-mono text-green-600">45ms</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RTSPPlayer;