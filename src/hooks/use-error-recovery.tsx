import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ErrorRecoveryOptions {
  maxRetries: number;
  retryDelay: number;
  enableAutoRecovery: boolean;
}

export const useErrorRecovery = (options: ErrorRecoveryOptions = {
  maxRetries: 3,
  retryDelay: 2000,
  enableAutoRecovery: true
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  const { toast } = useToast();

  const handleError = async (error: Error, recoveryAction?: () => Promise<void>) => {
    console.error('[Error Recovery]', error.message);
    setLastError(error);

    if (options.enableAutoRecovery && retryCount < options.maxRetries && recoveryAction) {
      setIsRecovering(true);
      setRetryCount(prev => prev + 1);

      toast({
        title: "Connection Issue",
        description: `Attempting to recover (${retryCount + 1}/${options.maxRetries})...`,
        variant: "destructive"
      });

      try {
        await new Promise(resolve => setTimeout(resolve, options.retryDelay));
        await recoveryAction();
        
        // Success - reset counters
        setRetryCount(0);
        setIsRecovering(false);
        setLastError(null);
        
        toast({
          title: "Connection Restored",
          description: "Successfully reconnected to the system",
        });
      } catch (retryError) {
        console.error('[Error Recovery] Retry failed:', retryError);
        setIsRecovering(false);
        
        if (retryCount >= options.maxRetries - 1) {
          toast({
            title: "Connection Failed",
            description: "Max retry attempts reached. Please check your connection.",
            variant: "destructive"
          });
        }
      }
    } else {
      toast({
        title: "System Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetErrorState = () => {
    setRetryCount(0);
    setIsRecovering(false);
    setLastError(null);
  };

  return {
    handleError,
    resetErrorState,
    retryCount,
    isRecovering,
    lastError,
    canRetry: retryCount < options.maxRetries
  };
};