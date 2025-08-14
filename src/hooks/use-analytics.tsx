import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_type: string;
  event_data: Record<string, any>;
  user_id?: string;
  session_id: string;
  timestamp: string;
  page_url: string;
  user_agent: string;
}

interface AnalyticsMetrics {
  pageViews: number;
  uniqueUsers: number;
  sessionDuration: number;
  bounceRate: number;
  conversionRate: number;
}

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();

  useEffect(() => {
    if (!sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', sessionId);
    }
  }, [sessionId]);

  const trackEvent = useCallback(async (
    eventType: string, 
    eventData: Record<string, any> = {}
  ) => {
    try {
      const event: AnalyticsEvent = {
        event_type: eventType,
        event_data: eventData,
        session_id: sessionId,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        user_agent: navigator.userAgent
      };

      // For now, just store in localStorage for demo
      const stored = localStorage.getItem('analytics_events') || '[]';
      const events = JSON.parse(stored);
      events.push(event);
      localStorage.setItem('analytics_events', JSON.stringify(events));

      // Also track to browser analytics if available
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', eventType, eventData);
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, [sessionId]);

  const trackPageView = useCallback(async (path: string) => {
    await trackEvent('page_view', { path });
  }, [trackEvent]);

  const trackUserAction = useCallback(async (action: string, context?: Record<string, any>) => {
    await trackEvent('user_action', { action, ...context });
  }, [trackEvent]);

  const trackPerformance = useCallback(async (metrics: Record<string, number>) => {
    await trackEvent('performance', metrics);
  }, [trackEvent]);

  const getMetrics = useCallback(async (dateRange: { start: string; end: string }) => {
    setLoading(true);
    try {
      // For demo, use localStorage
      const stored = localStorage.getItem('analytics_events') || '[]';
      const data = JSON.parse(stored);
      
      const filteredData = data.filter((e: any) => 
        e.timestamp >= dateRange.start && e.timestamp <= dateRange.end
      );

      if (filteredData) {
        // Calculate metrics
        const pageViews = filteredData.filter((e: any) => e.event_type === 'page_view').length;
        const uniqueUsers = new Set(filteredData.map((e: any) => e.user_id)).size;
        const sessions = new Set(filteredData.map((e: any) => e.session_id)).size;
        
        setMetrics({
          pageViews,
          uniqueUsers,
          sessionDuration: 0, // Calculate from session data
          bounceRate: 0, // Calculate bounce rate
          conversionRate: 0 // Calculate conversion rate
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    metrics,
    loading,
    trackEvent,
    trackPageView,
    trackUserAction,
    trackPerformance,
    getMetrics
  };
};