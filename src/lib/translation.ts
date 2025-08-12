import { supabase } from '@/integrations/supabase/client';

export async function detectLanguage(text: string): Promise<string> {
  try {
    const resp = await fetch(`${supabase.functions._getUrl()}/lang-detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!resp.ok) return 'unknown';
    const data = await resp.json();
    return (data.language as string) || 'unknown';
  } catch {
    return 'unknown';
  }
}

export async function translateText(text: string, target: string): Promise<string> {
  try {
    const resp = await fetch(`${supabase.functions._getUrl()}/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target }),
    });
    if (!resp.ok) return text;
    const data = await resp.json();
    return (data.translated as string) || text;
  } catch {
    return text;
  }
}
