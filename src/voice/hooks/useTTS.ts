import { useState, useCallback, useRef } from 'react';

interface TTSOptions {
  language: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useTTS = (options: TTSOptions) => {
  const { language, voice, rate = 1, pitch = 1, volume = 1 } = options;
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(() => 'speechSynthesis' in window);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Stop any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Set voice properties
    utterance.lang = language;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    // Find appropriate voice
    const voices = speechSynthesis.getVoices();
    if (voice) {
      const selectedVoice = voices.find(v => v.name === voice || v.lang === voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    } else {
      // Find voice matching language
      const langVoice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
      if (langVoice) {
        utterance.voice = langVoice;
      }
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    speechSynthesis.speak(utterance);
  }, [isSupported, language, voice, rate, pitch, volume]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    utteranceRef.current = null;
  }, []);

  const pause = useCallback(() => {
    speechSynthesis.pause();
  }, []);

  const resume = useCallback(() => {
    speechSynthesis.resume();
  }, []);

  const getVoices = useCallback(() => {
    return speechSynthesis.getVoices();
  }, []);

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
    pause,
    resume,
    getVoices
  };
};