
import React from 'react';
import { useOffline } from '@/hooks/use-offline';
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ConnectionStatus: React.FC = () => {
  const { isOnline } = useOffline();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive/90 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-2 p-2">
        <WifiOff className="h-4 w-4 text-destructive-foreground" />
        <span className="text-sm text-destructive-foreground font-medium">
          Нет подключения к интернету
        </span>
        <Badge variant="outline" className="border-destructive-foreground/20 text-destructive-foreground">
          Offline
        </Badge>
      </div>
    </div>
  );
};

export default ConnectionStatus;
