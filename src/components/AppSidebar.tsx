import { NavLink, useLocation } from 'react-router-dom';
import { LucideIcon, Home, Bot, CheckSquare, Users, Target, BarChart3, Shield, Award, ExternalLink, Settings, Plane, Factory, Wrench, Sparkles, Activity, Map, Radio, FileText } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAdmin } from '@/hooks/use-admin';
import { useLanguage } from '@/hooks/use-language';

interface Item {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
  variant?: 'default' | 'mission' | 'warning';
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { isAdmin } = useAdmin();
  const { t, language } = useLanguage();
  const currentPath = location.pathname;

  // UAV-focused navigation groups
  const operationsItems: Item[] = [
    { title: t.dashboard || 'Операционный центр', url: '/', icon: Home },
    // Operations Center pages - conditional on feature flags
    ...(import.meta.env.VITE_FEATURE_OPS_CENTER === 'true' ? [
      { title: 'Operations Center', url: '/ops-center', icon: Activity, badge: 'OPS' }
    ] : []),
    ...(import.meta.env.VITE_FEATURE_MISSION_CONTROL === 'true' ? [
      { title: 'Mission Control', url: '/mission-control', icon: Map, badge: 'LIVE', variant: 'mission' as const }
    ] : []),
    ...(import.meta.env.VITE_FEATURE_FLEET === 'true' ? [
      { title: 'Fleet Management', url: '/fleet', icon: Plane }
    ] : []),
    ...(import.meta.env.VITE_FEATURE_COMMAND_CENTER === 'true' ? [
      { title: 'Command Center', url: '/command-center', icon: Shield, badge: 'CTRL', variant: 'warning' as const }
    ] : []),
    { title: t.tasks || 'Задачи', url: '/tasks', icon: CheckSquare },
    { title: t.team || 'Команда', url: '/team', icon: Users }
  ];

  const productionItems: Item[] = [
    { title: t.production || 'Производство', url: '/production', icon: Factory },
    { title: t.projects || 'Проекты', url: '/projects', icon: Target },
    { title: t.maintenance || 'Техобслуживание', url: '/maintenance', icon: Wrench, badge: '3', variant: 'warning' }
  ];

  const systemItems: Item[] = [
    { title: t.analytics || 'Аналитика', url: '/analytics', icon: BarChart3 },
    { title: t.issues || 'Проблемы', url: '/issues', icon: Shield },
    { title: t.awards || 'Награды', url: '/awards', icon: Award },
    { title: t.aiAssistant || 'AI Помощник', url: '/ai-assistant', icon: Bot, badge: 'AI' }
  ];

  const adminItems: Item[] = [
    { title: t.documents || 'Документооборот', url: '/documents', icon: FileText },
    // System Logs - conditional on feature flag
    ...(import.meta.env.VITE_FEATURE_LOGS === 'true' ? [
      { title: 'System Logs', url: '/logs', icon: Radio, badge: 'LOG' }
    ] : []),
    // AI Operations - conditional on feature flag
    ...(import.meta.env.VITE_FEATURE_OPS_CENTER === 'true' ? [
      { title: 'AI Operations', url: '/ai-operations', icon: Sparkles, badge: 'AI' }
    ] : []),
    { title: t.integrations || 'Интеграции', url: '/integrations', icon: ExternalLink },
    ...(isAdmin ? [{ title: t.admin || 'Админ', url: '/admin', icon: Settings, badge: 'SYS' } as Item] : [])
  ];

  const isActive = (path: string) => currentPath === path;

  const getMenuButtonClass = (item: Item, active: boolean) => {
    if (active) {
      return 'bg-primary/20 text-primary font-medium border-l-2 border-primary';
    }
    
    if (item.variant === 'mission') {
      return 'hover:bg-primary/10 hover:text-primary hover:shadow-glow-primary';
    }
    
    if (item.variant === 'warning') {
      return 'hover:bg-warning/10 hover:text-warning';
    }
    
    return 'hover:bg-surface-1';
  };

  const renderMenuGroup = (items: Item[], label: string) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs text-muted-foreground font-ui font-semibold tracking-wider">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  end={item.url === '/'}
                  className={() => 
                    `${getMenuButtonClass(item, isActive(item.url))} flex items-center transition-all duration-200`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {state !== 'collapsed' && (
                    <>
                      <span className="font-ui">{item.title}</span>
                      {item.badge && (
                        <span className={`
                          ml-auto text-xs px-2 py-0.5 rounded-full font-mono font-medium
                          ${item.variant === 'mission' ? 'bg-primary/20 text-primary border border-primary/30' :
                            item.variant === 'warning' ? 'bg-warning/20 text-warning border border-warning/30' :
                            'bg-muted text-muted-foreground'}
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="bg-surface-1">
        {renderMenuGroup(operationsItems, 'ОПЕРАЦИИ')}
        {renderMenuGroup(productionItems, 'ПРОИЗВОДСТВО')}
        {renderMenuGroup(systemItems, 'АНАЛИТИКА')}
        {renderMenuGroup(adminItems, 'СЛУЖЕБНОЕ')}
      </SidebarContent>
    </Sidebar>
  );
}
