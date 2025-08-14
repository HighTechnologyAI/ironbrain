import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

const DefaultLoadingFallback = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-20 w-full" />
      </div>
    </CardContent>
  </Card>
);

export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  children,
  fallback = <DefaultLoadingFallback />,
  errorFallback
}) => (
  <ErrorBoundary fallback={errorFallback}>
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// Lazy load UAV components
export const LazyUAVDashboard = lazy(() => 
  import('@/pages/UAVDashboard').then(module => ({ default: module.default }))
);

export const LazyFleetManagement = lazy(() => 
  import('@/pages/FleetManagement').then(module => ({ default: module.default }))
);

export const LazyMissionControl = lazy(() => 
  import('@/pages/MissionControl').then(module => ({ default: module.default }))
);

export const LazyMissionControlOps = lazy(() => 
  import('@/pages/MissionControlOps').then(module => ({ default: module.default }))
);

export const LazyAIOperationsCenter = lazy(() => 
  import('@/pages/AIOperationsCenter').then(module => ({ default: module.default }))
);

// Lazy load other heavy components
export const LazyAnalytics = lazy(() => 
  import('@/pages/Analytics').then(module => ({ default: module.default }))
);

export const LazyAdminPanel = lazy(() => 
  import('@/pages/AdminPanel').then(module => ({ default: module.default }))
);

export const LazyMaintenanceCenter = lazy(() => 
  import('@/pages/MaintenanceCenter').then(module => ({ default: module.default }))
);