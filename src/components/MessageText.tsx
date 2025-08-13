import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/use-translation';

interface MessageTextProps {
  id: string;
  text: string;
  sourceLang?: string | null;
}

export default function MessageText({ id, text, sourceLang }: MessageTextProps) {
  const [showOriginal, setShowOriginal] = useState(false);
  const { translated, needsTranslation } = useTranslation(text, sourceLang);

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
