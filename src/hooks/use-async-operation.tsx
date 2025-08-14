import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export const useAsyncOperation = <T = any>() => {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null
  });
  const { toast } = useToast();

  const execute = useCallback(async (
    operation: () => Promise<T>,
    options?: {
      showSuccess?: boolean;
      successMessage?: string;
      showError?: boolean;
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await operation();
      
      setState({
        data: result,
        loading: false,
        error: null
      });

      if (options?.showSuccess && options?.successMessage) {
        toast({
          title: 'Success',
          description: options.successMessage,
        });
      }

      options?.onSuccess?.(result);
      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      
      setState({
        data: null,
        loading: false,
        error: errorMessage
      });

      if (options?.showError !== false) {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }

      options?.onError?.(error);
      return null;
    }
  }, [toast]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
};