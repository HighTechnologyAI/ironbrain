
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface OfflineContextType {
  isOnline: boolean;
  wasOffline: boolean;
}

const OfflineContext = createContext<OfflineContextType>({
  isOnline: true,
  wasOffline: false
});

export const OfflineProvider = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        toast({
          title: "Подключение восстановлено",
          description: "Приложение снова в сети",
          className: "border-primary/50 bg-primary/10",
        });
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      toast({
        title: "Нет подключения к интернету",
        description: "Некоторые функции могут быть недоступны",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, toast]);

  return (
    <OfflineContext.Provider value={{ isOnline, wasOffline }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  return useContext(OfflineContext);
};
