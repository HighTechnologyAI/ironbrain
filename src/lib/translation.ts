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
    console.log('translateText called for text length:', text.length, 'target:', target);
    
    // For very long texts, split into chunks
    if (text.length > 1000) {
      console.log('Text too long, splitting into chunks');
      // Split into sentences and translate in chunks
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const chunks = [];
      let currentChunk = '';
      
      for (const sentence of sentences) {
        if ((currentChunk + sentence).length > 800) {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = sentence;
        } else {
          currentChunk += (currentChunk ? '. ' : '') + sentence;
        }
      }
      if (currentChunk) chunks.push(currentChunk.trim());
      
      // Translate each chunk
      const translatedChunks = await Promise.all(
        chunks.map(async (chunk) => {
          // Check cache for each chunk
          const { data: cached } = await supabase
            .from('translations_cache')
            .select('translated_text')
            .eq('source_text', chunk)
            .eq('target_lang', target)
            .maybeSingle();
          
          if (cached) return cached.translated_text;
          
          // Translate chunk
          const { data, error } = await supabase.functions.invoke('translate', {
            body: { text: chunk, target }
          });
          
          if (error) return chunk;
          const translated = (data?.translated as string) || chunk;
          
          // Cache chunk translation
          if (translated !== chunk) {
            const sourceLang = await detectLanguage(chunk);
            supabase
              .from('translations_cache')
              .insert({
                source_text: chunk,
                source_lang: sourceLang,
                target_lang: target,
                translated_text: translated
              });
          }
          
          return translated;
        })
      );
      
      return translatedChunks.join('. ');
    }
    
    // Check cache first
    const { data: cached } = await supabase
      .from('translations_cache')
      .select('translated_text')
      .eq('source_text', text)
      .eq('target_lang', target)
      .maybeSingle();

    console.log('Cache result:', cached);
    if (cached) {
      console.log('Using cached translation');
      return cached.translated_text;
    }

    // Not in cache, translate and store
    console.log('Translating text...');
    const { data, error } = await supabase.functions.invoke('translate', {
      body: { text, target }
    });
    
    console.log('Translation response:', data, error);
    if (error) {
      console.error('Translation API error:', error);
      return text;
    }
    
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
