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
import { ru, bg, enUS } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'task_invitation' | 'chat_invitation' | 'general' | 'admin_announcement';
  title: string;
  message: string;
  data?: {
    task_id?: string;
    task_title?: string;
    inviter_name?: string;
    chat_invitation_id?: string;
  };
  read: boolean;
  created_at: string;
  expires_at?: string;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const dateLocale = language === 'bg' ? bg : language === 'en' ? enUS : ru;

  useEffect(() => {
    if (user) {
      loadNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      if (!user) return;

      // Получаем профиль пользователя для поиска уведомлений
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Загружаем уведомления из базы данных
      const { data: notificationsData, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Преобразуем данные в нужный формат
      const formattedNotifications: Notification[] = (notificationsData || []).map(notification => ({
        id: notification.id,
        type: notification.type as 'task_invitation' | 'chat_invitation' | 'general' | 'admin_announcement',
        title: notification.title,
        message: notification.message,
        data: (notification.data as any) || {},
        read: notification.read,
        created_at: notification.created_at,
        expires_at: notification.expires_at || undefined
      }));

      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    // Подписываемся на изменения в таблице уведомлений
    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications'
      }, () => {
        loadNotifications();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_invitations'
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

  const handleAcceptChatInvitation = async (notification: Notification) => {
    if (!notification.data?.chat_invitation_id || !user) return;

    try {
      // Получаем профиль пользователя
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Обновляем статус приглашения в чат на "принято"
      const { error } = await supabase
        .from('chat_invitations')
        .update({ 
          status: 'accepted', 
          responded_at: new Date().toISOString() 
        })
        .eq('id', notification.data.chat_invitation_id)
        .eq('invited_user_id', profile.id);

      if (error) throw error;

      toast({
        title: t.success,
        description: t.invitationAccepted,
      });

      markAsRead(notification.id);
    } catch (error) {
      console.error('Error accepting chat invitation:', error);
      toast({
        title: t.error,
        description: t.error,
        variant: 'destructive',
      });
    }
  };

  const handleDeclineInvitation = async (notification: Notification) => {
    // Если это приглашение в чат, обновляем статус
    if (notification.type === 'chat_invitation' && notification.data?.chat_invitation_id && user) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('chat_invitations')
            .update({ 
              status: 'declined', 
              responded_at: new Date().toISOString() 
            })
            .eq('id', notification.data.chat_invitation_id)
            .eq('invited_user_id', profile.id);
        }
      } catch (error) {
        console.error('Error declining chat invitation:', error);
      }
    }

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
                      
                      {(notification.type === 'task_invitation' || notification.type === 'chat_invitation') && !notification.read && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => 
                              notification.type === 'chat_invitation' 
                                ? handleAcceptChatInvitation(notification)
                                : handleAcceptInvitation(notification)
                            }
                            className="h-7 px-2 text-xs"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            {language === 'en' ? 'Join' : language === 'ru' ? 'Войти' : 'Влез'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeclineInvitation(notification)}
                            className="h-7 px-2 text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            {language === 'en' ? 'Cancel' : language === 'ru' ? 'Отменить' : 'Отказ'}
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