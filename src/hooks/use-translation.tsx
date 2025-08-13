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
// Global processing tracker to prevent duplicate requests
const processingTracker = new Set<string>();

export function useTranslation(text: string, sourceLang?: string | null) {
  const { language } = useLanguage();
  
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
      if (cached) {
        setState(cached);
        return;
      }

      // Prevent duplicate processing using global tracker
      if (processingTracker.has(cacheKey)) {
        return;
      }

      // Mark as being processed
      processingTracker.add(cacheKey);

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
        processingTracker.delete(cacheKey);
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
      } finally {
        // Always remove from processing tracker when done
        processingTracker.delete(cacheKey);
      }
    };

    handleTranslation();
  }, [cacheKey, text, language, sourceLang]);

  return state;
}