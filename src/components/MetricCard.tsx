import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  loading?: boolean;
  error?: string;
  subtitle?: string;
  format?: 'number' | 'percentage' | 'currency' | 'time';
}

const MetricCardComponent: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  loading = false,
  error,
  subtitle,
  format = 'number'
}) => {
  const formattedValue = useMemo(() => {
    if (loading || error) return '';
    
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return `$${value}`;
      case 'time':
        return `${value}h`;
      default:
        return value.toString();
    }
  }, [value, format, loading, error]);

  const changeIcon = useMemo(() => {
    if (!change && change !== 0) return null;
    
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="h-3 w-3" />;
      case 'decrease':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  }, [change, changeType]);

  const changeColor = useMemo(() => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  }, [changeType]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{formattedValue}</div>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {change !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${changeColor}`}>
                {changeIcon}
                <span>{change > 0 ? '+' : ''}{change}%</span>
                <span className="text-muted-foreground">from last period</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export const MetricCard = memo(MetricCardComponent);

// Pre-configured metric cards for common use cases
export const TaskMetricCard = memo<{ completed: number; total: number; loading?: boolean }>(
  ({ completed, total, loading }) => (
    <MetricCard
      title="Tasks Completed"
      value={`${completed}/${total}`}
      change={total > 0 ? Math.round((completed / total) * 100) : 0}
      changeType="increase"
      icon={<CheckCircle className="h-4 w-4" />}
      loading={loading}
      subtitle="This period"
    />
  )
);

export const TeamMetricCard = memo<{ activeMembers: number; totalMembers: number; loading?: boolean }>(
  ({ activeMembers, totalMembers, loading }) => (
    <MetricCard
      title="Active Team Members"
      value={`${activeMembers}/${totalMembers}`}
      icon={<Users className="h-4 w-4" />}
      loading={loading}
      subtitle="Currently online"
    />
  )
);

export const TimeMetricCard = memo<{ hours: number; target?: number; loading?: boolean }>(
  ({ hours, target, loading }) => (
    <MetricCard
      title="Hours Logged"
      value={hours}
      change={target ? Math.round(((hours - target) / target) * 100) : undefined}
      changeType={target && hours > target ? 'increase' : 'decrease'}
      icon={<Clock className="h-4 w-4" />}
      loading={loading}
      format="time"
      subtitle={target ? `Target: ${target}h` : undefined}
    />
  )
);