
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { useToast } from '@/hooks/use-toast';

export const usePushNotifications = () => {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [registrationToken, setRegistrationToken] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initializePushNotifications();
    }
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Запрос разрешения на уведомления
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        setIsPermissionGranted(true);
        await PushNotifications.register();

        // Получение токена регистрации
        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success, token: ' + token.value);
          setRegistrationToken(token.value);
        });

        // Обработка ошибок регистрации
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration: ' + JSON.stringify(error));
          toast({
            title: "Ошибка регистрации уведомлений",
            description: "Не удалось настроить push-уведомления",
            variant: "destructive",
          });
        });

        // Обработка входящих уведомлений
        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
          console.log('Push received: ' + JSON.stringify(notification));
          toast({
            title: notification.title || "Новое уведомление",
            description: notification.body || "",
            className: "border-primary/50 bg-primary/10",
          });
        });

        // Обработка действий с уведомлениями
        PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
          console.log('Push action performed: ' + JSON.stringify(notification));
        });
      } else {
        console.log('Push notification permission denied');
        setIsPermissionGranted(false);
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  };

  const sendLocalNotification = async (title: string, body: string) => {
    if (Capacitor.isNativePlatform()) {
      try {
        // Для локальных уведомлений нужен дополнительный плагин
        toast({
          title,
          description: body,
          className: "border-primary/50 bg-primary/10",
        });
      } catch (error) {
        console.error('Error sending local notification:', error);
      }
    }
  };

  return {
    isPermissionGranted,
    registrationToken,
    sendLocalNotification,
    initializePushNotifications
  };
};
