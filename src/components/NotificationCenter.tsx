import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Check, X, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { ru, bg } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'task_invitation' | 'chat_invitation' | 'general';
  title: string;
  message: string;
  data?: {
    task_id?: string;
    task_title?: string;
    inviter_name?: string;
  };
  read: boolean;
  created_at: string;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const dateLocale = language === 'bg' ? bg : ru;

  useEffect(() => {
    if (user) {
      loadNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      // В реальном проекте здесь была бы таблица notifications
      // Пока что используем mock данные
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'task_invitation',
          title: t.invitedToTask,
          message: `${t.invitedToTask}: "Тестирование системы задач"`,
          data: {
            task_id: 'task-1',
            task_title: 'Тестирование системы задач',
            inviter_name: 'OLEKSANDR KOVALCHUK'
          },
          read: false,
          created_at: new Date().toISOString()
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const subscribeToNotifications = () => {
    // В реальном проекте здесь была бы подписка на изменения таблицы notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'task_participants'
      }, () => {
        loadNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleAcceptInvitation = async (notification: Notification) => {
    if (!notification.data?.task_id || !user) return;

    try {
      const { error } = await supabase
        .from('task_participants')
        .insert({
          task_id: notification.data.task_id,
          user_id: user.id,
          role: 'participant'
        });

      if (error) throw error;

      toast({
        title: t.success,
        description: t.invitationAccepted,
      });

      markAsRead(notification.id);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: t.error,
        description: t.error,
        variant: 'destructive',
      });
    }
  };

  const handleDeclineInvitation = async (notification: Notification) => {
    toast({
      title: t.success,
      description: t.invitationDeclined,
    });
    markAsRead(notification.id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">{t.notifications}</h4>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                {t.markAllAsRead}
              </Button>
            )}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {t.noNotifications}
            </div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`border-0 border-b rounded-none ${!notification.read ? 'bg-muted/30' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <UserPlus className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(notification.created_at), 'dd.MM.yyyy HH:mm', { locale: dateLocale })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      
                      {notification.type === 'task_invitation' && !notification.read && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleAcceptInvitation(notification)}
                            className="h-7 px-2 text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            {t.acceptInvitation}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeclineInvitation(notification)}
                            className="h-7 px-2 text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            {t.declineInvitation}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;