import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface STTOptions {
  provider: 'openai-realtime' | 'webspeech-only';
  language: string;
  onInterimResult?: (text: string) => void;
  onFinalResult?: (text: string) => void;
  onError?: (error: string) => void;
}

interface RealtimeAudioData {
  float32Array: Float32Array;
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export const useSTT = (options: STTOptions) => {
  const { provider, language, onInterimResult, onFinalResult, onError } = options;
  
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [finalText, setFinalText] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<any>(null);

  // Encode audio for OpenAI API
  const encodeAudioForAPI = useCallback((float32Array: Float32Array): string => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    
    const uint8Array = new Uint8Array(int16Array.buffer);
    let binary = '';
    const chunkSize = 0x8000;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  }, []);

  // OpenAI Realtime WebSocket setup
  const setupRealtimeSTT = useCallback(async () => {
    try {
      // Get ephemeral token
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('voice-token');
      
      if (tokenError || !tokenData?.client_secret?.value) {
        throw new Error('Failed to get ephemeral token');
      }

      const EPHEMERAL_KEY = tokenData.client_secret.value;
      
      // Setup WebSocket connection
      const ws = new WebSocket(`wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        
        // Send session configuration
        ws.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: 'You are a voice assistant. Transcribe speech accurately.',
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 1000
            },
            temperature: 0.8
          }
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'conversation.item.input_audio_transcription.completed':
            setFinalText(data.transcript);
            onFinalResult?.(data.transcript);
            break;
          case 'conversation.item.input_audio_transcription.failed':
            onError?.('Transcription failed');
            break;
          case 'input_audio_buffer.speech_started':
            setIsListening(true);
            break;
          case 'input_audio_buffer.speech_stopped':
            setIsListening(false);
            break;
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.('WebSocket connection failed');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsListening(false);
      };

      return ws;
    } catch (error) {
      console.error('Error setting up realtime STT:', error);
      onError?.('Failed to setup realtime STT');
      return null;
    }
  }, [onFinalResult, onError]);

  // Web Speech API setup
  const setupWebSpeechSTT = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onError?.('Speech recognition not supported');
      return null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      
      if (interim) {
        setInterimText(interim);
        onInterimResult?.(interim);
      }
      
      if (final) {
        setFinalText(final);
        onFinalResult?.(final);
        setInterimText('');
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      onError?.(event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;
    return recognition;
  }, [language, onInterimResult, onFinalResult, onError]);

  const startListening = useCallback(async () => {
    if (provider === 'openai-realtime') {
      const ws = await setupRealtimeSTT();
      if (!ws) return;

      // Setup audio recording for WebSocket
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 24000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const encodedAudio = encodeAudioForAPI(new Float32Array(inputData));
            
            ws.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: encodedAudio
            }));
          }
        };

        source.connect(processor);
        processor.connect(audioContextRef.current.destination);
        
        recorderRef.current = { stream, processor };
      } catch (error) {
        console.error('Error setting up audio recording:', error);
        onError?.('Failed to access microphone');
      }
    } else {
      const recognition = setupWebSpeechSTT();
      if (recognition) {
        recognition.start();
      }
    }
  }, [provider, setupRealtimeSTT, setupWebSpeechSTT, encodeAudioForAPI, onError]);

  const stopListening = useCallback(() => {
    if (provider === 'openai-realtime') {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      if (recorderRef.current) {
        recorderRef.current.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        recorderRef.current.processor.disconnect();
        recorderRef.current = null;
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }
    
    setIsListening(false);
    setInterimText('');
  }, [provider]);

  return {
    isListening,
    interimText,
    finalText,
    startListening,
    stopListening
  };
};