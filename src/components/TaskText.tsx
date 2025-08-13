import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { translateText, detectLanguage } from '@/lib/translation';

interface TaskTextProps {
  text: string;
  type: 'title' | 'description';
  sourceLang?: string | null;
  className?: string;
}

const TaskText: React.FC<TaskTextProps> = ({ 
  text, 
  type, 
  sourceLang = null, 
  className = '' 
}) => {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [detectedLang, setDetectedLang] = useState<string | null>(sourceLang);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    const handleTranslation = async () => {
      if (!text || text.trim() === '') {
        setTranslatedText('');
        return;
      }

      // Если язык не определен, определяем его
      if (!detectedLang) {
        const detected = await detectLanguage(text);
        setDetectedLang(detected);
      }

      const currentDetectedLang = detectedLang || await detectLanguage(text);

      // Если язык совпадает с текущим языком системы, показываем оригинал
      if (currentDetectedLang === language || currentDetectedLang === 'unknown') {
        setTranslatedText(text);
        return;
      }

      // Переводим текст
      setIsTranslating(true);
      try {
        const translated = await translateText(text, language);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(text); // Показываем оригинал при ошибке
      } finally {
        setIsTranslating(false);
      }
    };

    handleTranslation();
  }, [text, language, detectedLang]);

  const needsTranslation = detectedLang && detectedLang !== language && detectedLang !== 'unknown';

  if (isTranslating) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="animate-spin w-3 h-3 border-2 border-current border-t-transparent rounded-full"></div>
          <span className="text-xs">
            {language === 'ru' ? 'Перевод...' : 'Превод...'}
          </span>
        </div>
      </div>
    );
  }

  const displayText = showOriginal ? text : (translatedText || text);

  return (
    <div className={className}>
      {type === 'title' ? (
        <h2 className="text-lg font-semibold leading-tight">
          {displayText}
        </h2>
      ) : (
        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
          {displayText}
        </div>
      )}
      
      {needsTranslation && (
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="mt-1 text-xs text-primary hover:underline focus:outline-none"
        >
          {showOriginal 
            ? (language === 'ru' ? 'Показать перевод' : 'Показване на превод')
            : (language === 'ru' ? 'Показать оригинал' : 'Показване на оригинал')
          }
          {detectedLang && detectedLang !== 'unknown' && (
            <span className="ml-1 opacity-70">
              ({detectedLang.toUpperCase()})
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default TaskText;