import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { translations, type Translations } from '@/lib/i18n';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Мемоизируем объект переводов для предотвращения лишних ререндеров
  const t = useMemo(() => {
    return translations[language] || translations.en;
  }, [language]);

  // Мемоизируем контекст значения
  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language, t, setLanguage]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};