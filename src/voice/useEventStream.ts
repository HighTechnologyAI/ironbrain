import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export interface UIEvent {
  type: 'route_change' | 'click' | 'form_submit';
  route?: string;
  title?: string;
  action?: string;
  payload?: any;
  timestamp: number;
}

interface EventStreamOptions {
  enabled: boolean;
  maxEvents?: number;
  onEvent?: (event: UIEvent) => void;
}

export const useEventStream = (options: EventStreamOptions) => {
  const location = useLocation();
  const eventsRef = useRef<UIEvent[]>([]);
  const { enabled, maxEvents = 50, onEvent } = options;

  // Track route changes
  useEffect(() => {
    if (!enabled) return;

    const event: UIEvent = {
      type: 'route_change',
      route: location.pathname,
      title: document.title,
      timestamp: Date.now()
    };

    eventsRef.current.push(event);
    if (eventsRef.current.length > maxEvents) {
      eventsRef.current = eventsRef.current.slice(-maxEvents);
    }

    onEvent?.(event);
  }, [location.pathname, enabled, maxEvents, onEvent]);

  // Track clicks with data-ai-action
  const handleClick = useCallback((e: MouseEvent) => {
    if (!enabled) return;

    const target = e.target as HTMLElement;
    const actionElement = target.closest('[data-ai-action]');
    
    if (actionElement) {
      const action = actionElement.getAttribute('data-ai-action');
      const payload = actionElement.getAttribute('data-ai-payload');
      
      const event: UIEvent = {
        type: 'click',
        action: action || undefined,
        payload: payload ? JSON.parse(payload) : undefined,
        timestamp: Date.now()
      };

      eventsRef.current.push(event);
      if (eventsRef.current.length > maxEvents) {
        eventsRef.current = eventsRef.current.slice(-maxEvents);
      }

      onEvent?.(event);
    }
  }, [enabled, maxEvents, onEvent]);

  // Track form submissions
  const handleFormSubmit = useCallback((e: SubmitEvent) => {
    if (!enabled) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Redact sensitive data
    const sanitizedData: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        // Redact potential PII
        if (key.toLowerCase().includes('password') || 
            key.toLowerCase().includes('iban') ||
            key.toLowerCase().includes('phone') ||
            key.toLowerCase().includes('email')) {
          sanitizedData[key] = `[REDACTED_${key.toUpperCase()}]`;
        } else {
          sanitizedData[key] = value.length > 100 ? '[LONG_TEXT]' : value;
        }
      }
    }

    const event: UIEvent = {
      type: 'form_submit',
      action: form.getAttribute('data-ai-action') || 'form_submit',
      payload: sanitizedData,
      timestamp: Date.now()
    };

    eventsRef.current.push(event);
    if (eventsRef.current.length > maxEvents) {
      eventsRef.current = eventsRef.current.slice(-maxEvents);
    }

    onEvent?.(event);
  }, [enabled, maxEvents, onEvent]);

  // Setup event listeners
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('submit', handleFormSubmit, { passive: true });

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleFormSubmit);
    };
  }, [enabled, handleClick, handleFormSubmit]);

  return {
    events: eventsRef.current,
    getRecentEvents: (count: number = 10) => eventsRef.current.slice(-count),
    clearEvents: () => { eventsRef.current = []; }
  };
};