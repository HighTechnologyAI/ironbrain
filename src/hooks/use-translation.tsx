import { useState, useEffect, useRef, useMemo } from 'react';
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
  const processedRef = useRef(new Set<string>());
  
  // Create stable cache key
  const cacheKey = useMemo(() => {
    return `${text.trim()}-${sourceLang || 'auto'}-${language}`;
  }, [text, sourceLang, language]);
  
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
    console.log('useTranslation effect triggered for:', cacheKey, 'processed:', processedRef.current.has(cacheKey));
    
    // Prevent duplicate processing
    if (processedRef.current.has(cacheKey)) {
      console.log('Already processed, skipping:', cacheKey);
      return;
    }

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
      console.log('Cache check for:', cacheKey, 'cached:', cached);
      if (cached) {
        console.log('Using cached translation:', cached);
        setState(cached);
        return;
      }

      // Mark as being processed
      console.log('Starting translation process for:', cacheKey);
      processedRef.current.add(cacheKey);

      // Detect language if not provided
      let currentDetectedLang = sourceLang;
      if (!currentDetectedLang) {
        try {
          currentDetectedLang = await detectLanguage(text);
        } catch {
          currentDetectedLang = 'unknown';
        }
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
        setState(noTranslationState);
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
      setState(translatingState);
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
        
        setState(finalState);
        translationCache.set(cacheKey, finalState);
      } catch (error) {
        console.error('Translation error:', error);
        const errorState = {
          translated: text,
          isTranslating: false,
          detectedLang: currentDetectedLang,
          needsTranslation: true
        };
        
        setState(errorState);
        translationCache.set(cacheKey, errorState);
      }
    };

    handleTranslation();

    // Cleanup when component unmounts
    return () => {
      processedRef.current.delete(cacheKey);
    };
  }, [cacheKey, text, language, sourceLang]);

  return state;
}