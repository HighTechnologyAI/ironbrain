
import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export const useMobileFeatures = () => {
  const [safeAreaInsets, setSafeAreaInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  });
  const [isNativeMobile, setIsNativeMobile] = useState(false);

  useEffect(() => {
    const setupMobileFeatures = async () => {
      if (Capacitor.isNativePlatform()) {
        setIsNativeMobile(true);
        
        // Настройка статус-бара для темной темы
        try {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#0a0b0e' });
        } catch (error) {
          console.log('StatusBar not available:', error);
        }

        // Получение Safe Area инсетов
        const updateSafeArea = () => {
          const computedStyle = getComputedStyle(document.documentElement);
          setSafeAreaInsets({
            top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)')) || 0,
            bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)')) || 0,
            left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)')) || 0,
            right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)')) || 0,
          });
        };

        updateSafeArea();
        window.addEventListener('resize', updateSafeArea);
        
        return () => window.removeEventListener('resize', updateSafeArea);
      }
    };

    setupMobileFeatures();
  }, []);

  // Haptic Feedback функции
  const triggerHapticFeedback = async (style: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (Capacitor.isNativePlatform()) {
      try {
        const impactStyle = style === 'light' ? ImpactStyle.Light : 
                          style === 'heavy' ? ImpactStyle.Heavy : ImpactStyle.Medium;
        await Haptics.impact({ style: impactStyle });
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }
  };

  const triggerNotificationHaptic = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }
  };

  return {
    safeAreaInsets,
    isNativeMobile,
    triggerHapticFeedback,
    triggerNotificationHaptic
  };
};
