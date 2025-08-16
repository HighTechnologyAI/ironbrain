import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enCommon from './locales/en/common.json';
import ruCommon from './locales/ru/common.json';
import bgCommon from './locales/bg/common.json';

const resources = {
  en: {
    common: enCommon,
  },
  ru: {
    common: ruCommon,
  },
  bg: {
    common: bgCommon,
  },
};

import { ConfigService } from '@/services/configService';

const supportedLngs = ConfigService.getUIConfig().supportedLanguages;
const defaultLng = ConfigService.getUIConfig().defaultLanguage;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLng,
    fallbackLng: 'en',
    supportedLngs,
    
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false,
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language',
    },
    
    // Namespace configuration
    defaultNS: 'common',
    ns: ['common'],
    
    // Handle missing keys
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lng, ns, key) => {
      if (import.meta.env.DEV) {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
    },
  });

export default i18n;