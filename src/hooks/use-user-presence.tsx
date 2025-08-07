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
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Создаем канал для отслеживания присутствия
    const channel = supabase.channel('user_presence');

    // Слушаем изменения присутствия
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users: UserPresence[] = [];
        
        Object.keys(presenceState).forEach(key => {
          const presences = presenceState[key];
          if (presences && presences.length > 0) {
            // Извлекаем данные пользователя из первого элемента присутствия
            const presence = presences[0] as any;
            if (presence.user_id) {
              users.push(presence as UserPresence);
            }
          }
        });
        
        setOnlineUsers(users);
        setUserCount(users.length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        // Убираем избыточное логирование для production
        if (process.env.NODE_ENV === 'development') {
          console.log('User joined:', newPresences);
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        // Убираем избыточное логирование для production
        if (process.env.NODE_ENV === 'development') {
          console.log('User left:', leftPresences);
        }
      });

    // Подписываемся на канал
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Отправляем информацию о своем присутствии
        const userStatus: UserPresence = {
          user_id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email || '',
          online_at: new Date().toISOString(),
          status: 'online'
        };

        await channel.track(userStatus);
      }
    });

    // Периодически обновляем время присутствия (увеличено до 5 минут для снижения нагрузки)
    const statusInterval = setInterval(async () => {
      if (document.visibilityState === 'visible') {
        const userStatus: UserPresence = {
          user_id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.email || '',
          online_at: new Date().toISOString(),
          status: 'online'
        };
        
        await channel.track(userStatus);
      }
    }, 300000); // Обновляем каждые 5 минут и только если страница активна

    // Cleanup при размонтировании
    return () => {
      clearInterval(statusInterval);
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    onlineUsers,
    userCount,
    isOnline: (userId: string) => onlineUsers.some(u => u.user_id === userId)
  };
};