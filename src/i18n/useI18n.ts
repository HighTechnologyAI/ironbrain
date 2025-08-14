import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

export const useI18n = () => {
  const { t, i18n } = useTranslation('common');
  
  const formatDate = useMemo(() => {
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'ru' ? 'ru-RU' : 'en-US';
    
    return {
      short: (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat(locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(d);
      },
      
      long: (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat(locale, {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(d);
      },
      
      time: (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat(locale, {
          hour: '2-digit',
          minute: '2-digit'
        }).format(d);
      },
      
      relative: (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
        const diff = Math.round((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return rtf.format(diff, 'day');
      }
    };
  }, [i18n.language]);
  
  const formatNumber = useMemo(() => {
    const locale = i18n.language === 'bg' ? 'bg-BG' : 
                   i18n.language === 'ru' ? 'ru-RU' : 'en-US';
    
    return {
      decimal: (num: number, decimals = 2) => {
        return new Intl.NumberFormat(locale, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals
        }).format(num);
      },
      
      currency: (num: number, currency = 'EUR') => {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency
        }).format(num);
      },
      
      percent: (num: number) => {
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }).format(num / 100);
      }
    };
  }, [i18n.language]);
  
  return {
    t,
    i18n,
    formatDate,
    formatNumber,
    currentLanguage: i18n.language as 'en' | 'ru' | 'bg',
    changeLanguage: i18n.changeLanguage
  };
};