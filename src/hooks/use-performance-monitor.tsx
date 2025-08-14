import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  fps: number;
  loadTime: number;
}

interface PerformanceThresholds {
  renderTime: number; // ms
  memoryUsage: number; // MB
  fps: number;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  renderTime: 16, // 60fps target
  memoryUsage: 100, // MB
  fps: 45
};

export const usePerformanceMonitor = (
  componentName: string,
  thresholds = DEFAULT_THRESHOLDS
) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const renderStartTime = useRef<number>(Date.now());
  const frameCount = useRef<number>(0);
  const lastFrameTime = useRef<number>(performance.now());

  // Measure render performance
  const markRenderStart = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  const markRenderEnd = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    // Get memory usage if available
    const memory = (performance as any).memory;
    const memoryUsage = memory ? memory.usedJSHeapSize / 1024 / 1024 : undefined;

    // Calculate FPS
    const now = performance.now();
    const deltaTime = now - lastFrameTime.current;
    const fps = deltaTime > 0 ? 1000 / deltaTime : 0;
    lastFrameTime.current = now;
    frameCount.current++;

    const newMetrics: PerformanceMetrics = {
      renderTime,
      memoryUsage,
      fps,
      loadTime: performance.now()
    };

    setMetrics(newMetrics);

    // Check for performance issues
    const newWarnings: string[] = [];
    
    if (renderTime > thresholds.renderTime) {
      newWarnings.push(`Slow render: ${renderTime.toFixed(2)}ms (threshold: ${thresholds.renderTime}ms)`);
    }
    
    if (memoryUsage && memoryUsage > thresholds.memoryUsage) {
      newWarnings.push(`High memory usage: ${memoryUsage.toFixed(2)}MB (threshold: ${thresholds.memoryUsage}MB)`);
    }
    
    if (fps < thresholds.fps) {
      newWarnings.push(`Low FPS: ${fps.toFixed(1)} (threshold: ${thresholds.fps})`);
    }

    if (newWarnings.length > 0) {
      console.warn(`Performance warnings for ${componentName}:`, newWarnings);
      setWarnings(newWarnings);
    } else {
      setWarnings([]);
    }
  }, [componentName, thresholds]);

  // Auto-monitor renders
  useEffect(() => {
    markRenderStart();
    return () => {
      markRenderEnd();
    };
  });

  // Performance observer for navigation timing
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log(`Navigation timing for ${componentName}:`, {
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
              total: navEntry.loadEventEnd - navEntry.fetchStart
            });
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });

      return () => observer.disconnect();
    }
  }, [componentName]);

  return {
    metrics,
    warnings,
    markRenderStart,
    markRenderEnd,
    isPerformant: warnings.length === 0
  };
};

// HOC for automatic performance monitoring
export const withPerformanceMonitor = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Component';
    const { warnings, isPerformant } = usePerformanceMonitor(name);

    // Show performance warnings in development
    useEffect(() => {
      if (process.env.NODE_ENV === 'development' && warnings.length > 0) {
        console.group(`🐌 Performance Issues - ${name}`);
        warnings.forEach(warning => console.warn(warning));
        console.groupEnd();
      }
    }, [warnings, name]);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPerformanceMonitor(${componentName || 'Component'})`;
  return WrappedComponent;
};