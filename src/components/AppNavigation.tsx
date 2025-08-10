import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationCenter from '@/components/NotificationCenter';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { usePerformanceData } from '@/hooks/use-performance-data';
import {
  ArrowLeft,
  LogOut,
  Home,
  CheckSquare,
  Users,
  Target,
  BarChart3,
  Shield,
  Award,
  Settings,
  Bot,
  Bell,
  ExternalLink
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface AppNavigationProps {
  showBackButton?: boolean;
  title?: string;
  subtitle?: string;
}

const AppNavigation: React.FC<AppNavigationProps> = ({ 
  showBackButton = false, 
  title,
  subtitle 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { data: performanceData } = usePerformanceData();

  const navigationItems = [
    { 
      key: 'dashboard', 
      path: '/', 
      icon: Home, 
      label: t.dashboard || 'Главная',
      badge: null
    },
    { 
      key: 'ai-assistant', 
      path: '/ai-assistant', 
      icon: Bot, 
      label: t.aiAssistant || 'AI Помощник',
      badge: 'AI',
      special: true
    },
    { 
      key: 'tasks', 
      path: '/tasks', 
      icon: CheckSquare, 
      label: t.myTasks || 'Задачи',
      badge: performanceData.pendingTasks > 0 ? performanceData.pendingTasks.toString() : null
    },
    { 
      key: 'team', 
      path: '/team', 
      icon: Users, 
      label: t.team || 'Команда',
      badge: performanceData.activeTeamMembers > 0 ? performanceData.activeTeamMembers.toString() : null
    },
    { 
      key: 'projects', 
      path: '/projects', 
      icon: Target, 
      label: t.projects || 'Проекты',
      badge: null
    },
    { 
      key: 'analytics', 
      path: '/analytics', 
      icon: BarChart3, 
      label: t.analytics || 'Аналитика',
      badge: null
    },
    { 
      key: 'issues', 
      path: '/issues', 
      icon: Shield, 
      label: t.problems || 'Проблемы',
      badge: performanceData.overdueTasks > 0 ? performanceData.overdueTasks.toString() : null,
      variant: 'destructive' as const
    },
    { 
      key: 'awards', 
      path: '/awards', 
      icon: Award, 
      label: t.achievements_page || 'Награды',
      badge: performanceData.totalAchievements > 0 ? performanceData.totalAchievements.toString() : null,
      variant: 'accent' as const
    },
    { 
      key: 'integrations', 
      path: '/integrations', 
      icon: ExternalLink, 
      label: 'Интеграции',
      badge: null
    },
    { 
      key: 'admin', 
      path: '/admin', 
      icon: Settings, 
      label: t.admin || 'Админ',
      badge: 'SYS',
      variant: 'secondary' as const
    }
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-background/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-90 transition-opacity"
              aria-label="Главная"
            >
              <img
                src="/lovable-uploads/b9c645a9-9cf4-49fc-9d3b-d74b8e43825e.png"
                alt="Логотип TIGER CRM"
                className="h-8 w-8"
                loading="lazy"
              />
            </button>
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={goBack}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {title && (
              <div>
                <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-sm text-muted-foreground">
              {user?.email}
            </div>
            
            <LanguageSwitcher />

            <NotificationCenter />

            <Button 
              variant="outline" 
              size="sm"
              onClick={signOut}
              className="hover:bg-destructive/10 hover:border-destructive"
              title={t.logout || 'Выйти'}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppNavigation;