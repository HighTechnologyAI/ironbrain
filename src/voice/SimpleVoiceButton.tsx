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

  const speak = async (text: string) => {
    try {
      console.log('🎤 Начинаю озвучивание:', text);
      
      // Используем Supabase client для вызова edge функции
      const { data, error } = await supabase.functions.invoke('ai-text-to-speech', {
        body: { 
          text, 
          voice: 'alloy'
        }
      });

      if (error) {
        console.error('❌ TTS Edge Function Error:', error);
        fallbackSpeak(text);
        return;
      }

      if (!data) {
        console.error('❌ No audio data received');
        fallbackSpeak(text);
        return;
      }

      console.log('✅ TTS Response received');

      // Создаем аудио из blob данных
      const audioBlob = new Blob([data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onloadstart = () => console.log('🎵 Audio loading started');
      audio.oncanplay = () => console.log('🎵 Audio can play');
      audio.onplay = () => console.log('🎵 Audio started playing');
      audio.onended = () => {
        console.log('🎵 Audio finished playing');
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = (e) => {
        console.error('❌ Audio playback error:', e);
        URL.revokeObjectURL(audioUrl);
        fallbackSpeak(text);
      };
      
      await audio.play();
      console.log('🎵 Live voice audio playing...');
      
    } catch (error) {
      console.error('❌ Speech error:', error);
      fallbackSpeak(text);
    }
  };

  const fallbackSpeak = (text: string) => {
    console.log('Using fallback browser TTS');
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  const handleTranscript = async (transcript: string) => {
    console.log('🎙️ Распознано:', transcript);
    
    // Показываем что обрабатываем
    toast({
      title: "Обрабатываю...",
      description: transcript,
    });
    
    try {
      const { data: user } = await supabase.auth.getUser();
      
      console.log('📤 Отправляю в AI роутер:', transcript);
      
      // Отправляем в AI роутер для живого общения
      const { data, error } = await supabase.functions.invoke('ai-router', {
        body: {
          transcript,
          events: [
            {
              type: 'voice_chat',
              route: window.location.pathname,
              timestamp: Date.now()
            }
          ],
          locale: 'ru-RU',
          user_id: user.user?.id
        }
      });

      console.log('📥 Ответ от AI роутера:', data, error);

      if (error) {
        console.error('❌ AI Router error:', error);
        await speak('Извините, произошла ошибка при обращении к помощнику');
        toast({
          title: "Ошибка",
          description: "Не удалось связаться с AI помощником",
          variant: "destructive"
        });
        return;
      }

      // Произносим ответ
      if (data?.replyText) {
        console.log('🔊 Начинаю говорить:', data.replyText);
        await speak(data.replyText);
        toast({
          title: "IronBrain говорит:",
          description: data.replyText,
        });
      } else {
        console.log('⚠️ Нет replyText в ответе AI роутера, полный ответ:', data);
        await speak('Не удалось получить ответ от помощника');
        toast({
          title: "Проблема",
          description: "Получен пустой ответ от помощника",
          variant: "destructive"
        });
      }

      // Выполняем команды если есть
      if (data?.commands) {
        console.log('⚡ Выполняю команды:', data.commands);
        for (const command of data.commands) {
          console.log('Executing command:', command);
          const result = await commandDispatcher.current.execute(command);
          console.log('Command result:', result);
        }
      }

    } catch (error) {
      console.error('❌ Error processing transcript:', error);
      await speak('Произошла ошибка при обработке запроса');
      toast({
        title: "Ошибка",
        description: "Не удалось обработать голосовую команду",
        variant: "destructive"
      });
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

  // Всегда показываем кнопку (упрощенная версия)
  // const isVoiceEnabled = import.meta.env.VITE_VOICE_AI_ENABLED === 'true';
  // if (!isVoiceEnabled) {
  //   return null;
  // }

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