import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusChip } from '@/components/neon/StatusChip';
import { Button } from '@/components/neon/Button';
import { 
  Activity, 
  Users, 
  Zap, 
  Target, 
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SystemHealth from '@/components/SystemHealth';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Quick stats for the dashboard
  const stats = [
    {
      title: t('common.tasks', 'Tasks'),
      value: '24',
      change: '+12%',
      icon: CheckCircle,
      color: 'text-success'
    },
    {
      title: t('common.team', 'Team'),
      value: '8',
      change: '+2',
      icon: Users,
      color: 'text-info'
    },
    {
      title: t('common.projects', 'Projects'),
      value: '5',
      change: '100%',
      icon: Target,
      color: 'text-primary'
    },
    {
      title: t('common.alerts', 'Alerts'),
      value: '3',
      change: '-2',
      icon: AlertTriangle,
      color: 'text-warning'
    }
  ];

  // Quick actions based on available features
  const quickActions = [];
  
  if (import.meta.env.VITE_FEATURE_OPS_CENTER === 'true') {
    quickActions.push({
      title: 'Operations Center',
      description: 'Monitor system status and KPIs',
      icon: Activity,
      action: () => navigate('/ops-center'),
      variant: 'neon' as const
    });
  }
  
  if (import.meta.env.VITE_FEATURE_MISSION_CONTROL === 'true') {
    quickActions.push({
      title: 'Mission Control',
      description: 'Real-time UAV management',
      icon: Zap,
      action: () => navigate('/mission-control'),
      variant: 'neon' as const
    });
  }
  
  quickActions.push(
    {
      title: t('common.tasks', 'Tasks'),
      description: 'Manage your work items',
      icon: CheckCircle,
      action: () => navigate('/tasks'),
      variant: 'neon-outline' as const
    },
    {
      title: t('common.team', 'Team'),
      description: 'Collaborate with colleagues',
      icon: Users,
      action: () => navigate('/team'),
      variant: 'neon-outline' as const
    }
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('navigation.dashboard', 'Operations Dashboard')}
        </h1>
        <p className="text-muted-foreground">
          Welcome to the IronBrain CRM Operations Center
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="transition-all hover:shadow-medium">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>{stat.change} from last period</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <div>
                      <h4 className="font-medium">{action.title}</h4>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <Button
                    variant={action.variant}
                    size="sm"
                    onClick={action.action}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* System Status */}
        <SystemHealth />
      </div>
    </div>
  );
};

export default Dashboard;