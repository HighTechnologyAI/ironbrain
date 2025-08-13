import { supabase } from '@/integrations/supabase/client';

export async function detectLanguage(text: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('lang-detect', {
      body: { text }
    });
    if (error) return 'unknown';
    return (data?.language as string) || 'unknown';
  } catch {
    return 'unknown';
  }
}

export async function translateText(text: string, target: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('translate', {
      body: { text, target }
    });
    if (error) return text;
    return (data?.translated as string) || text;
  } catch {
    return text;
  }
}
