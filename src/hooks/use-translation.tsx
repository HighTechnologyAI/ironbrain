import { useState, useEffect, useRef } from 'react';
import { translateText, detectLanguage } from '@/lib/translation';
import { useLanguage } from '@/hooks/use-language';

interface TranslationState {
  translated: string;
  isTranslating: boolean;
  detectedLang: string | null;
  needsTranslation: boolean;
}

// Global cache to share translations across components
const translationCache = new Map<string, TranslationState>();

export function useTranslation(text: string, sourceLang?: string | null) {
  const { language } = useLanguage();
  const cacheKey = `${text}-${language}`;
  const isMountedRef = useRef(true);
  
  // Initialize state from cache if available
  const [state, setState] = useState<TranslationState>(() => {
    const cached = translationCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    return {
      translated: text,
      isTranslating: false,
      detectedLang: sourceLang || null,
      needsTranslation: false
    };
  });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const handleTranslation = async () => {
      if (!text || text.trim() === '') {
        const emptyState = {
          translated: '',
          isTranslating: false,
          detectedLang: null,
          needsTranslation: false
        };
        setState(emptyState);
        translationCache.set(cacheKey, emptyState);
        return;
      }

      // Check cache first
      const cached = translationCache.get(cacheKey);
      if (cached && !cached.isTranslating) {
        setState(cached);
        return;
      }

      // Detect language if not provided
      let currentDetectedLang = sourceLang;
      if (!currentDetectedLang) {
        currentDetectedLang = await detectLanguage(text);
      }

      // Check if translation is needed
      const needsTranslation = currentDetectedLang && 
        currentDetectedLang !== language && 
        currentDetectedLang !== 'unknown';

      if (!needsTranslation) {
        const noTranslationState = {
          translated: text,
          isTranslating: false,
          detectedLang: currentDetectedLang,
          needsTranslation: false
        };
        if (isMountedRef.current) {
          setState(noTranslationState);
        }
        translationCache.set(cacheKey, noTranslationState);
        return;
      }

      // Set translating state
      const translatingState = {
        translated: text,
        isTranslating: true,
        detectedLang: currentDetectedLang,
        needsTranslation: true
      };
      if (isMountedRef.current) {
        setState(translatingState);
      }
      translationCache.set(cacheKey, translatingState);

      try {
        // Translate text
        const translated = await translateText(text, language);
        
        const finalState = {
          translated,
          isTranslating: false,
          detectedLang: currentDetectedLang,
          needsTranslation: true
        };
        
        if (isMountedRef.current) {
          setState(finalState);
        }
        translationCache.set(cacheKey, finalState);
      } catch (error) {
        console.error('Translation error:', error);
        const errorState = {
          translated: text,
          isTranslating: false,
          detectedLang: currentDetectedLang,
          needsTranslation: true
        };
        
        if (isMountedRef.current) {
          setState(errorState);
        }
        translationCache.set(cacheKey, errorState);
      }
    };

    handleTranslation();
  }, [text, language, sourceLang]); // Removed cacheKey from dependencies

  return state;
}