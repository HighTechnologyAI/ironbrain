import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enCommon from './locales/en/common.json';
import ruCommon from './locales/ru/common.json';
import bgCommon from './locales/bg/common.json';
import enOps from './locales/en/ops.json';
import ruOps from './locales/ru/ops.json';
import bgOps from './locales/bg/ops.json';

const resources = {
  en: {
    translation: { ...enCommon, ...enOps },
  },
  ru: {
    translation: { ...ruCommon, ...ruOps },
  },
  bg: {
    translation: { ...bgCommon, ...bgOps },
  },
};

const supportedLngs = ['en', 'ru', 'bg'];
const defaultLng = import.meta.env.VITE_LOCALE_DEFAULT || 'ru';

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
    
    // Handle missing keys
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lng, ns, key) => {
      if (import.meta.env.DEV) {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
    },
  });

export default i18n;