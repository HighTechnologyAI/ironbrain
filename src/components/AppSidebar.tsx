import { NavLink, useLocation } from 'react-router-dom';
import { LucideIcon, Home, Bot, CheckSquare, Users, Target, BarChart3, Shield, Award, ExternalLink, Settings } from 'lucide-react';
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

interface Item {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { isAdmin } = useAdmin();
  const currentPath = location.pathname;

  const items: Item[] = [
    { title: 'Главная', url: '/', icon: Home },
    { title: 'AI Помощник', url: '/ai-assistant', icon: Bot, badge: 'AI' },
    { title: 'Задачи', url: '/tasks', icon: CheckSquare },
    { title: 'Команда', url: '/team', icon: Users },
    { title: 'Проекты', url: '/projects', icon: Target },
    { title: 'Аналитика', url: '/analytics', icon: BarChart3 },
    { title: 'Проблемы', url: '/issues', icon: Shield },
    { title: 'Награды', url: '/awards', icon: Award },
    { title: 'Интеграции', url: '/integrations', icon: ExternalLink },
    ...(isAdmin ? [{ title: 'Админ', url: '/admin', icon: Settings, badge: 'SYS' } as Item] : []),
  ];

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive: active }) =>
                        `${active ? 'bg-muted text-primary font-medium' : 'hover:bg-muted/50'} flex items-center`
                      }
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {state !== 'collapsed' && <span>{item.title}</span>}
                      {item.badge && state !== 'collapsed' && (
                        <span className="ml-auto rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
