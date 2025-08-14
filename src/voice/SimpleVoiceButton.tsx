import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CommandDispatcher } from './commandSchema';
import { toast } from '@/components/ui/use-toast';

export const SimpleVoiceButton: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const commandDispatcher = useRef(CommandDispatcher.getInstance());

  useEffect(() => {
    // Проверяем поддержку речевого API
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setIsSupported(supported);
    
    if (!supported) {
      console.warn('Speech recognition not supported');
    }
  }, []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const handleTranscript = async (transcript: string) => {
    console.log('Распознано:', transcript);
    
    try {
      const { data: user } = await supabase.auth.getUser();
      
      // Отправляем в AI роутер
      const { data, error } = await supabase.functions.invoke('ai-router', {
        body: {
          transcript,
          events: [],
          locale: 'ru-RU',
          user_id: user.user?.id
        }
      });

      if (error) {
        console.error('AI Router error:', error);
        speak('Ошибка обработки команды');
        return;
      }

      // Произносим ответ
      if (data.replyText) {
        speak(data.replyText);
      }

      // Выполняем команды
      if (data.commands) {
        for (const command of data.commands) {
          await commandDispatcher.current.execute(command);
        }
      }

    } catch (error) {
      console.error('Error processing transcript:', error);
      speak('Произошла ошибка');
    }
  };

  const startListening = () => {
    if (!isSupported) {
      toast({
        title: "Не поддерживается",
        description: "Голосовое управление не поддерживается в этом браузере",
        variant: "destructive"
      });
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'ru-RU';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
        console.log('Слушаю...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        if (transcript) {
          handleTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast({
            title: "Доступ запрещен",
            description: "Разрешите доступ к микрофону для голосового управления",
            variant: "destructive"
          });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Закончил слушать');
      };

      recognitionRef.current = recognition;
      recognition.start();

    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Проверяем, включена ли функция
  const isVoiceEnabled = import.meta.env.VITE_VOICE_AI_ENABLED === 'true';
  
  if (!isVoiceEnabled) {
    return null;
  }

  const button = (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <Button
        onClick={toggleListening}
        className={`
          w-16 h-16 rounded-full shadow-lg transition-all duration-300
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : 'bg-primary hover:bg-primary-hover'
          }
        `}
        disabled={!isSupported}
      >
        {isListening ? (
          <MicOff className="h-8 w-8 text-white" />
        ) : (
          <Mic className="h-8 w-8 text-white" />
        )}
      </Button>
      
      {isListening && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg px-3 py-1 text-sm whitespace-nowrap">
          Говорите...
        </div>
      )}
    </div>
  );

  return createPortal(button, document.body);
};