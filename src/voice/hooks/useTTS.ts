import { useState, useCallback, useRef } from 'react';

interface TTSOptions {
  language: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useTTS = (options: TTSOptions) => {
  const { language = 'ru-RU' } = options;
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(async (text: string) => {
    if (!text.trim()) return;

    try {
      // Попробуем использовать OpenAI TTS сначала
      console.log('🎤 Начинаю озвучивание:', text);
      
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.functions.invoke('ai-text-to-speech', {
        body: { 
          text, 
          voice: 'alloy'
        }
      });

      if (!error && data) {
        console.log('✅ TTS Response received');
        
        // Создаем аудио из ArrayBuffer
        const audioBlob = new Blob([data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio();
        
        audio.src = audioUrl;
        audio.preload = 'auto';
        
        setIsSpeaking(true);
        
        audio.addEventListener('ended', () => {
          console.log('🎵 Audio finished playing');
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        });
        
        audio.addEventListener('error', (e) => {
          console.error('❌ Audio playback error:', e);
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          // Fallback to browser TTS
          fallbackSpeak(text);
        });

        await audio.load();
        await audio.play();
        console.log('🎵 OpenAI voice audio playing...');
        return;
      }
    } catch (error) {
      console.error('❌ OpenAI TTS failed:', error);
    }
    
    // Fallback to browser speech synthesis
    fallbackSpeak(text);
  }, [language]);

  const fallbackSpeak = useCallback((text: string) => {
    console.log('Using fallback browser TTS');
    
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [language]);

  const stop = useCallback(() => {
    setIsSpeaking(false);
    speechSynthesis.cancel();
  }, []);

  return {
    isSpeaking,
    speak,
    stop
  };
};