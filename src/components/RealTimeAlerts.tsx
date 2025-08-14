import React, { useEffect } from 'react';
import { useRealTimeEvents } from '@/hooks/use-real-time-telemetry';
import { toast } from 'sonner';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

const getSeverityIcon = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
    case 'error':
      return <XCircle className="h-4 w-4" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4" />;
    case 'info':
      return <Info className="h-4 w-4" />;
    default:
      return <CheckCircle className="h-4 w-4" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
    case 'error':
      return 'destructive';
    case 'warning':
      return 'warning';
    default:
      return 'default';
  }
};

export const RealTimeAlerts: React.FC = () => {
  const { latestEvent } = useRealTimeEvents();

  useEffect(() => {
    if (latestEvent && latestEvent.severity !== 'info') {
      const icon = getSeverityIcon(latestEvent.severity);
      const severity = latestEvent.severity?.toUpperCase() || 'EVENT';
      
      toast(latestEvent.message || 'System Event', {
        description: `${severity} - ${latestEvent.event_type}`,
        duration: latestEvent.severity === 'critical' ? 10000 : 5000,
        action: latestEvent.severity === 'critical' ? {
          label: 'Acknowledge',
          onClick: () => {
            // Handle acknowledgment
            console.log('Event acknowledged:', latestEvent.id);
          }
        } : undefined,
      });
    }
  }, [latestEvent]);

  return null; // This component doesn't render anything visible
};

export default RealTimeAlerts;