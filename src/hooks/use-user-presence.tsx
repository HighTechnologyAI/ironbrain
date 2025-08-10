import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface UserPresence {
  user_id: string;
  email: string;
  full_name?: string;
  online_at: string;
  status: 'online' | 'away' | 'offline';
}

export const useUserPresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let channel: any = null;
    let statusInterval: NodeJS.Timeout | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const createConnection = () => {
      // Очищаем предыдущий канал если есть
      if (channel) {
        supabase.removeChannel(channel);
      }

      // Создаем общий канал присутствия для всех пользователей
      const channelName = 'user_presence';
      channel = supabase.channel(channelName, {
        config: {
          presence: {
            key: user.id
          }
        }
      });

      // Слушаем изменения присутствия с дебаунсингом
      let syncTimeout: NodeJS.Timeout | null = null;
      
      channel
        .on('presence', { event: 'sync' }, () => {
          if (syncTimeout) clearTimeout(syncTimeout);
          syncTimeout = setTimeout(() => {
            const presenceState = channel.presenceState();
            const users: UserPresence[] = [];
            
            Object.keys(presenceState).forEach(key => {
              const presences = presenceState[key];
              if (presences && presences.length > 0) {
                const presence = presences[0] as any;
                if (presence.user_id) {
                  users.push(presence as UserPresence);
                }
              }
            });
            
            setOnlineUsers(users);
            setUserCount(users.length);
          }, 500); // Дебаунс на 500мс
        })
        .on('presence', { event: 'join' }, () => {
          // Минимальное логирование
        })
        .on('presence', { event: 'leave' }, () => {
          // Минимальное логирование
        });

      // Подписываемся на канал с обработкой ошибок
      channel.subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          
          const userStatus: UserPresence = {
            user_id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email || '',
            online_at: new Date().toISOString(),
            status: 'online'
          };

          try {
            await channel.track(userStatus);
          } catch (error) {
            console.error('Failed to track presence:', error);
          }
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          // Переподключение через 10 секунд при ошибке
          reconnectTimeout = setTimeout(createConnection, 10000);
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false);
          // Переподключение через 5 секунд при таймауте
          reconnectTimeout = setTimeout(createConnection, 5000);
        }
      });
    };

    // Создаем первое подключение
    createConnection();

    // Обновляем статус реже и только при активной вкладке
    statusInterval = setInterval(async () => {
      if (document.visibilityState === 'visible' && channel) {
        const userStatus: UserPresence = {
          user_id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email || '',
          online_at: new Date().toISOString(),
          status: 'online'
        };
        
        try {
          await channel.track(userStatus);
        } catch (error) {
          // При ошибке обновления пробуем переподключиться
          setIsConnected(false);
          createConnection();
        }
      }
    }, 600000); // Увеличено до 10 минут

    // Обработка видимости страницы
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && channel) {
        // При скрытии страницы отмечаем как away
        const userStatus: UserPresence = {
          user_id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email || '',
          online_at: new Date().toISOString(),
          status: 'away'
        };
        channel.track(userStatus).catch(() => {});
      } else if (document.visibilityState === 'visible' && channel) {
        // При возвращении на страницу отмечаем как online
        const userStatus: UserPresence = {
          user_id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email || '',
          online_at: new Date().toISOString(),
          status: 'online'
        };
        channel.track(userStatus).catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup при размонтировании
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (statusInterval) clearInterval(statusInterval);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      
      if (channel) {
        // Отмечаем как offline перед отключением
        const userStatus: UserPresence = {
          user_id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email || '',
          online_at: new Date().toISOString(),
          status: 'offline'
        };
        channel.track(userStatus).catch(() => {});
        
        // Небольшая задержка перед удалением канала
        setTimeout(() => {
          supabase.removeChannel(channel);
        }, 1000);
      }
      
      setIsConnected(false);
    };
  }, [user]);

  return {
    onlineUsers,
    userCount,
    isOnline: (userId: string) => onlineUsers.some(u => u.user_id === userId)
  };
};