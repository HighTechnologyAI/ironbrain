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

      // Создаем аудио из ArrayBuffer
      const audioBlob = new Blob([data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio();
      
      // Устанавливаем источник
      audio.src = audioUrl;
      audio.preload = 'auto';
      
      // Добавляем обработчики событий
      audio.addEventListener('loadstart', () => console.log('🎵 Audio loading started'));
      audio.addEventListener('canplay', () => console.log('🎵 Audio can play'));
      audio.addEventListener('play', () => console.log('🎵 Audio started playing'));
      audio.addEventListener('ended', () => {
        console.log('🎵 Audio finished playing');
        URL.revokeObjectURL(audioUrl);
      });
      
      audio.addEventListener('error', (e) => {
        console.error('❌ Audio playback error:', e);
        console.error('❌ Audio error details:', audio.error);
        URL.revokeObjectURL(audioUrl);
        fallbackSpeak(text);
      });

      // Пытаемся загрузить и воспроизвести
      try {
        await audio.load();
        await audio.play();
        console.log('🎵 Live voice audio playing...');
      } catch (playError) {
        console.error('❌ Play error:', playError);
        URL.revokeObjectURL(audioUrl);
        fallbackSpeak(text);
      }
      
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
    console.log('🎯 Начинаю процесс прослушивания...');
    
    if (!isSupported) {
      console.log('❌ Speech recognition не поддерживается');
      toast({
        title: "Не поддерживается",
        description: "Голосовое управление не поддерживается в этом браузере",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('🔧 Создаю SpeechRecognition...');
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'ru-RU';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        console.log('✅ Speech recognition запущен, слушаю...');
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        console.log('📝 Получен результат распознавания:', event);
        const transcript = event.results[0][0].transcript.trim();
        console.log('🎙️ Финальный transcript:', transcript);
        if (transcript) {
          handleTranscript(transcript);
        } else {
          console.log('⚠️ Пустой transcript');
        }
      };

      recognition.onerror = (event: any) => {
        console.error('❌ Recognition error:', event.error, event);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          console.log('🚫 Доступ к микрофону запрещен');
          toast({
            title: "Доступ запрещен",
            description: "Разрешите доступ к микрофону для голосового управления",
            variant: "destructive"
          });
        } else {
          console.log('⚠️ Другая ошибка распознавания:', event.error);
        }
      };

      recognition.onend = () => {
        console.log('🏁 Speech recognition завершен');
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      console.log('🚀 Запускаю recognition.start()');
      recognition.start();

    } catch (error) {
      console.error('💥 Не удалось запустить распознавание:', error);
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
    console.log('🎛️ Переключение прослушивания, текущее состояние:', isListening);
    if (isListening) {
      console.log('⏹️ Останавливаю прослушивание');
      stopListening();
    } else {
      console.log('▶️ Начинаю прослушивание');
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