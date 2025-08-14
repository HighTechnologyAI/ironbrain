import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useVAD } from './hooks/useVAD';
import { useSTT } from './hooks/useSTT';
import { useTTS } from './hooks/useTTS';
import { useHotkeys } from './hooks/useHotkeys';
import { useEventStream } from './useEventStream';
import { CommandDispatcher, type Command } from './commandSchema';
import { supabase } from '@/integrations/supabase/client';

type VoiceMode = 'ptt' | 'always';
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

interface VoiceAssistantState {
  enabled: boolean;
  mode: VoiceMode;
  listening: boolean;
  speaking: boolean;
  interimText: string;
  finalText: string;
  connectionStatus: ConnectionStatus;
  errors: string[];
  volume: number;
  isVoiceActivity: boolean;
}

interface VoiceAssistantActions {
  toggle: () => void;
  start: () => void;
  stop: () => void;
  setMode: (mode: VoiceMode) => void;
  say: (text: string) => void;
  execute: (command: Command) => Promise<void>;
  pushToTalkStart: () => void;
  pushToTalkEnd: () => void;
  clearErrors: () => void;
}

interface VoiceAssistantContextValue extends VoiceAssistantState, VoiceAssistantActions {}

const VoiceAssistantContext = createContext<VoiceAssistantContextValue | undefined>(undefined);

export const useVoiceAssistant = () => {
  const context = useContext(VoiceAssistantContext);
  if (!context) {
    throw new Error('useVoiceAssistant must be used within VoiceAssistantProvider');
  }
  return context;
};

interface VoiceAssistantProviderProps {
  children: React.ReactNode;
}

export const VoiceAssistantProvider: React.FC<VoiceAssistantProviderProps> = ({ children }) => {
  // Check if voice AI is enabled
  const isVoiceAIEnabled = import.meta.env.VITE_VOICE_AI_ENABLED === 'true';
  const provider = import.meta.env.VITE_VOICE_AI_PROVIDER || 'openai-realtime';
  const inputLang = import.meta.env.VITE_VOICE_INPUT_LANG || 'ru-RU';
  const outputLang = import.meta.env.VITE_VOICE_OUTPUT_LANG || 'ru-RU';

  const [state, setState] = useState<VoiceAssistantState>({
    enabled: false,
    mode: 'ptt',
    listening: false,
    speaking: false,
    interimText: '',
    finalText: '',
    connectionStatus: 'disconnected',
    errors: [],
    volume: 0,
    isVoiceActivity: false
  });

  const commandDispatcher = useRef(CommandDispatcher.getInstance());
  const sessionId = useRef(crypto.randomUUID());

  // Event stream for UI context
  const { events, getRecentEvents } = useEventStream({
    enabled: state.enabled && isVoiceAIEnabled
  });

  // Voice Activity Detection
  const { isVoiceActivity, volume } = useVAD({
    enabled: state.enabled && state.mode === 'always'
  });

  // Speech-to-Text
  const { isListening, interimText, finalText, startListening, stopListening } = useSTT({
    provider: provider as 'openai-realtime' | 'webspeech-only',
    language: inputLang,
    onFinalResult: handleTranscript,
    onError: (error) => addError(error)
  });

  // Text-to-Speech
  const { isSpeaking, speak, stop: stopSpeaking } = useTTS({
    language: outputLang
  });

  // Update state from hooks
  React.useEffect(() => {
    setState(prev => ({
      ...prev,
      listening: isListening,
      speaking: isSpeaking,
      interimText,
      finalText,
      volume,
      isVoiceActivity
    }));
  }, [isListening, isSpeaking, interimText, finalText, volume, isVoiceActivity]);

  function addError(error: string) {
    setState(prev => ({
      ...prev,
      errors: [...prev.errors.slice(-4), error]
    }));
  }

  async function handleTranscript(transcript: string) {
    if (!transcript.trim()) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Call AI router
      const { data, error } = await supabase.functions.invoke('ai-router', {
        body: {
          transcript,
          events: getRecentEvents(5),
          locale: inputLang,
          user_id: user.user?.id
        }
      });

      if (error) throw error;

      // Speak response
      if (data.replyText) {
        speak(data.replyText);
      }

      // Execute commands
      if (data.commands) {
        for (const command of data.commands) {
          await commandDispatcher.current.execute(command);
        }
      }

    } catch (error) {
      console.error('Error processing transcript:', error);
      addError('Failed to process voice command');
    }
  }

  const actions: VoiceAssistantActions = {
    toggle: () => {
      if (!isVoiceAIEnabled) return;
      
      setState(prev => {
        const newEnabled = !prev.enabled;
        if (!newEnabled) {
          stopListening();
          stopSpeaking();
        }
        return { ...prev, enabled: newEnabled };
      });
    },

    start: () => {
      if (!isVoiceAIEnabled || !state.enabled) return;
      startListening();
    },

    stop: () => {
      stopListening();
      stopSpeaking();
    },

    setMode: (mode: VoiceMode) => {
      setState(prev => ({ ...prev, mode }));
    },

    say: (text: string) => {
      if (!isVoiceAIEnabled) return;
      speak(text);
    },

    execute: async (command: Command) => {
      await commandDispatcher.current.execute(command);
    },

    pushToTalkStart: () => {
      if (state.mode === 'ptt' && state.enabled) {
        startListening();
      }
    },

    pushToTalkEnd: () => {
      if (state.mode === 'ptt') {
        stopListening();
      }
    },

    clearErrors: () => {
      setState(prev => ({ ...prev, errors: [] }));
    }
  };

  // Hotkeys
  useHotkeys({
    enabled: isVoiceAIEnabled,
    onToggleOverlay: actions.toggle,
    onPushToTalkStart: actions.pushToTalkStart,
    onPushToTalkEnd: actions.pushToTalkEnd
  });

  const contextValue: VoiceAssistantContextValue = {
    ...state,
    ...actions
  };

  return (
    <VoiceAssistantContext.Provider value={contextValue}>
      {children}
    </VoiceAssistantContext.Provider>
  );
};