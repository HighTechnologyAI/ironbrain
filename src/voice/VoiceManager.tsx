import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { CommandDispatcher } from './commandSchema';

// Unified voice system - consolidates all voice functionality
type VoiceProvider = 'openai' | 'elevenlabs' | 'browser';
type VoiceMode = 'simple-button' | 'advanced-overlay' | 'continuous';

interface VoiceConfig {
  provider: VoiceProvider;
  mode: VoiceMode;
  language: string;
  voiceId?: string; // For ElevenLabs
  model?: string;   // For ElevenLabs
}

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isConnected: boolean;
  currentProvider: VoiceProvider;
  volume: number;
  transcript: string;
  error: string | null;
}

interface VoiceActions {
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string, provider?: VoiceProvider) => Promise<void>;
  stopSpeaking: () => void;
  setConfig: (config: Partial<VoiceConfig>) => void;
  executeCommand: (command: any) => Promise<void>;
}

interface VoiceContextValue extends VoiceState, VoiceActions {
  config: VoiceConfig;
}

const VoiceContext = createContext<VoiceContextValue | undefined>(undefined);

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceManager');
  }
  return context;
};

interface VoiceManagerProps {
  children: React.ReactNode;
  defaultConfig?: Partial<VoiceConfig>;
}

export const VoiceManager: React.FC<VoiceManagerProps> = ({ 
  children, 
  defaultConfig = {} 
}) => {
  const [config, setConfigState] = useState<VoiceConfig>({
    provider: 'openai',
    mode: 'simple-button',
    language: 'ru-RU',
    ...defaultConfig
  });

  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    isConnected: false,
    currentProvider: config.provider,
    volume: 0,
    transcript: '',
    error: null
  });

  const recognitionRef = useRef<any>(null);
  const commandDispatcher = useRef(CommandDispatcher.getInstance());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // OpenAI TTS (high quality)
  const speakOpenAI = useCallback(async (text: string) => {
    try {
      setState(prev => ({ ...prev, isSpeaking: true, currentProvider: 'openai' }));
      
      const { data, error } = await supabase.functions.invoke('ai-text-to-speech', {
        body: { text, voice: 'alloy' }
      });

      if (error) throw error;

      const audioBlob = new Blob([data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.onerror = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        URL.revokeObjectURL(audioUrl);
        throw new Error('Audio playback failed');
      };

      await audioRef.current.play();
    } catch (error) {
      console.error('OpenAI TTS failed:', error);
      setState(prev => ({ ...prev, isSpeaking: false }));
      throw error;
    }
  }, []);

  // ElevenLabs TTS (premium quality)
  const speakElevenLabs = useCallback(async (text: string) => {
    try {
      setState(prev => ({ ...prev, isSpeaking: true, currentProvider: 'elevenlabs' }));
      
      const { data, error } = await supabase.functions.invoke('elevenlabs-tts', {
        body: { 
          text, 
          voice_id: config.voiceId || '9BWtsMINqrJLrRacOk9x',
          model_id: config.model || 'eleven_multilingual_v2'
        }
      });

      if (error) throw error;
      
      // Handle ElevenLabs response similar to OpenAI
      const audioBlob = new Blob([data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        URL.revokeObjectURL(audioUrl);
      };

      await audioRef.current.play();
    } catch (error) {
      console.error('ElevenLabs TTS failed:', error);
      setState(prev => ({ ...prev, isSpeaking: false }));
      throw error;
    }
  }, [config.voiceId, config.model]);

  // Browser TTS (fallback)
  const speakBrowser = useCallback(async (text: string) => {
    return new Promise<void>((resolve, reject) => {
      setState(prev => ({ ...prev, isSpeaking: true, currentProvider: 'browser' }));
      
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = config.language;
      utterance.rate = 0.9;
      utterance.onend = () => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        resolve();
      };
      utterance.onerror = (e) => {
        setState(prev => ({ ...prev, isSpeaking: false }));
        reject(e);
      };

      speechSynthesis.speak(utterance);
    });
  }, [config.language]);

  // Unified speak function with provider fallback
  const speak = useCallback(async (text: string, provider?: VoiceProvider) => {
    const targetProvider = provider || config.provider;
    
    try {
      switch (targetProvider) {
        case 'openai':
          await speakOpenAI(text);
          break;
        case 'elevenlabs':
          await speakElevenLabs(text);
          break;
        case 'browser':
          await speakBrowser(text);
          break;
      }
    } catch (error) {
      console.error(`${targetProvider} TTS failed, trying fallback`);
      if (targetProvider !== 'browser') {
        try {
          await speakBrowser(text);
        } catch (fallbackError) {
          setState(prev => ({ 
            ...prev, 
            error: 'All TTS providers failed',
            isSpeaking: false 
          }));
          toast({
            title: "TTS Error", 
            description: "Speech synthesis failed",
            variant: "destructive"
          });
        }
      }
    }
  }, [config.provider, speakOpenAI, speakElevenLabs, speakBrowser]);

  // Speech recognition
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast({
        title: "Not supported",
        description: "Speech recognition not supported in this browser",
        variant: "destructive"
      });
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = config.language;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => setState(prev => ({ ...prev, isListening: true }));
      recognition.onend = () => setState(prev => ({ ...prev, isListening: false }));
      recognition.onerror = (event: any) => {
        setState(prev => ({ ...prev, isListening: false, error: event.error }));
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        setState(prev => ({ ...prev, transcript }));
        
        if (transcript) {
          try {
            await processVoiceCommand(transcript);
          } catch (error) {
            console.error('Voice command processing failed:', error);
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Failed to start speech recognition' }));
    }
  }, [config.language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  const stopSpeaking = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    speechSynthesis.cancel();
    setState(prev => ({ ...prev, isSpeaking: false }));
  }, []);

  // Process voice commands through AI router
  const processVoiceCommand = useCallback(async (transcript: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('ai-router', {
        body: {
          transcript,
          events: [{ type: 'voice_command', route: window.location.pathname, timestamp: Date.now() }],
          locale: config.language,
          user_id: user.user?.id
        }
      });

      if (error) throw error;

      if (data?.replyText) {
        await speak(data.replyText);
      }

      if (data?.commands) {
        for (const command of data.commands) {
          await commandDispatcher.current.execute(command);
        }
      }
    } catch (error) {
      console.error('Voice command processing failed:', error);
      await speak('Произошла ошибка при обработке команды');
    }
  }, [config.language, speak]);

  const setConfig = useCallback((newConfig: Partial<VoiceConfig>) => {
    setConfigState(prev => ({ ...prev, ...newConfig }));
  }, []);

  const executeCommand = useCallback(async (command: any): Promise<void> => {
    await commandDispatcher.current.execute(command);
  }, []);

  const contextValue: VoiceContextValue = {
    ...state,
    config,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    setConfig,
    executeCommand
  };

  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
};