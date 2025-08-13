import React, { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useTranslation } from '@/hooks/use-translation';

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
  const [showOriginal, setShowOriginal] = useState(false);
  const { translated, isTranslating, detectedLang, needsTranslation } = useTranslation(text, sourceLang);

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

  const displayText = showOriginal ? text : translated;

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