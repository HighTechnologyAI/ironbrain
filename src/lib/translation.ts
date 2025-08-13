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
    // Check cache first
    const { data: cached } = await supabase
      .from('translations_cache')
      .select('translated_text')
      .eq('source_text', text)
      .eq('target_lang', target)
      .maybeSingle();

    if (cached) {
      return cached.translated_text;
    }

    // Not in cache, translate and store
    const { data, error } = await supabase.functions.invoke('translate', {
      body: { text, target }
    });
    
    if (error) return text;
    
    const translated = (data?.translated as string) || text;
    
    // Store in cache (don't await to avoid blocking)
    if (translated !== text) {
      const sourceLang = await detectLanguage(text);
      // Fire and forget cache insert
      supabase
        .from('translations_cache')
        .insert({
          source_text: text,
          source_lang: sourceLang,
          target_lang: target,
          translated_text: translated
        });
    }
    
    return translated;
  } catch {
    return text;
  }
}
