import { useEffect, useState } from 'react';
import { translateText } from '@/lib/translation';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/use-language';

interface MessageTextProps {
  id: string;
  text: string;
  sourceLang?: string | null;
}

export default function MessageText({ id, text, sourceLang }: MessageTextProps) {
  const { language } = useLanguage();
  const [showOriginal, setShowOriginal] = useState(false);
  const [translated, setTranslated] = useState<string | null>(null);
  const needsTranslation = sourceLang && language && sourceLang !== 'unknown' && sourceLang !== language;

  useEffect(() => {
    let cancelled = false;
    if (needsTranslation) {
      translateText(text, language).then((t) => {
        if (!cancelled) setTranslated(t);
      });
    } else {
      setTranslated(null);
    }
    return () => { cancelled = true; };
  }, [id, text, language, needsTranslation]);

  if (!needsTranslation) {
    return <p className="text-sm text-muted-foreground">{text}</p>;
  }

  return (
    <div className="space-y-1">
      {!showOriginal && translated && (
        <p className="text-sm text-muted-foreground">{translated}</p>
      )}
      {showOriginal && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
      <div className="flex items-center gap-2">
        <Badge variant="outline">Auto‑translated</Badge>
        <button
          type="button"
          onClick={() => setShowOriginal((v) => !v)}
          className="text-xs text-muted-foreground underline"
        >
          {showOriginal ? 'Hide original' : `Show original${sourceLang ? ` (${sourceLang})` : ''}`}
        </button>
      </div>
    </div>
  );
}
