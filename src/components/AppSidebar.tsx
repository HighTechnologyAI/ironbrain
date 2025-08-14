import { NavLink, useLocation } from 'react-router-dom';
import { LucideIcon, Home, Bot, CheckSquare, Users, Target, BarChart3, Shield, Award, ExternalLink, Settings, Plane, Factory, Wrench, Sparkles, Activity, Map, Radio, FileText, TestTube } from 'lucide-react';
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
import { useFeatures, isFeatureEnabled } from '@/utils/features';

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
  const { isCRMMode, isUAVMode, isHybridMode } = useFeatures();
  const currentPath = location.pathname;

  // Core CRM навигация
  const coreItems: Item[] = [
    { title: t.dashboard || 'Панель управления', url: '/', icon: Home },
    { title: t.tasks || 'Задачи', url: '/tasks', icon: CheckSquare },
    { title: t.team || 'Команда', url: '/team', icon: Users },
    { title: t.projects || 'Проекты', url: '/projects', icon: Target },
  ];

  // UAV операции (только если включены UAV функции)
  const operationsItems: Item[] = [
    ...(isFeatureEnabled('UAV_OPERATIONS') ? [
      { title: 'Operations Center', url: '/ops-center', icon: Activity, badge: 'OPS' }
    ] : []),
    ...(isFeatureEnabled('MISSION_CONTROL') ? [
      { title: 'Mission Control', url: '/mission-control', icon: Map, badge: 'LIVE', variant: 'mission' as const }
    ] : []),
    ...(isFeatureEnabled('FLEET_MANAGEMENT') ? [
      { title: 'Fleet Management', url: '/fleet', icon: Plane }
    ] : []),
    ...(isFeatureEnabled('UAV_OPERATIONS') ? [
      { title: 'Command Center', url: '/command-center', icon: Shield, badge: 'CTRL', variant: 'warning' as const }
    ] : []),
  ];

  // Производство (UAV-специфичная функциональность)
  const productionItems: Item[] = [
    ...(isFeatureEnabled('UAV_OPERATIONS') ? [
      { title: t.production || 'Производство', url: '/production', icon: Factory },
      { title: t.maintenance || 'Техобслуживание', url: '/maintenance', icon: Wrench, badge: '3', variant: 'warning' as 'warning' }
    ] : []),
  ];

  const systemItems: Item[] = [
    { title: t.analytics || 'Аналитика', url: '/analytics', icon: BarChart3 },
    { title: t.issues || 'Проблемы', url: '/issues', icon: Shield },
    { title: t.awards || 'Награды', url: '/awards', icon: Award },
    ...(isFeatureEnabled('AI_ASSISTANT') ? [
      { title: t.aiAssistant || 'AI Помощник', url: '/ai-assistant', icon: Bot, badge: 'AI' }
    ] : []),
  ];

  const adminItems: Item[] = [
    ...(isFeatureEnabled('UAV_OPERATIONS') ? [
      { title: t.documents || 'Документооборот', url: '/documents', icon: FileText }
    ] : []),
    ...(isFeatureEnabled('UAV_OPERATIONS') ? [
      { title: 'System Logs', url: '/logs', icon: Radio, badge: 'LOG' }
    ] : []),
    ...(isFeatureEnabled('UAV_OPERATIONS') ? [
      { title: 'AI Operations', url: '/ai-operations', icon: Sparkles, badge: 'AI' }
    ] : []),
    { title: 'Testing Center', url: '/testing', icon: TestTube, badge: 'QA' },
    ...(isFeatureEnabled('INTEGRATIONS') ? [
      { title: t.integrations || 'Интеграции', url: '/integrations', icon: ExternalLink }
    ] : []),
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
        {/* Core CRM - всегда показываем */}
        {renderMenuGroup(coreItems, isCRMMode ? 'УПРАВЛЕНИЕ' : 'ОСНОВНОЕ')}
        
        {/* UAV операции - только если включены */}
        {operationsItems.length > 0 && renderMenuGroup(operationsItems, 'ОПЕРАЦИИ')}
        
        {/* Производство - только для UAV режима */}
        {productionItems.length > 0 && renderMenuGroup(productionItems, 'ПРОИЗВОДСТВО')}
        
        {/* Системные функции */}
        {renderMenuGroup(systemItems, 'АНАЛИТИКА')}
        
        {/* Административные функции */}
        {adminItems.length > 0 && renderMenuGroup(adminItems, 'СЛУЖЕБНОЕ')}
      </SidebarContent>
    </Sidebar>
  );
}
