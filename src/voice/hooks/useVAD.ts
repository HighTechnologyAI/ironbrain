import { useState, useEffect, useRef, useCallback } from 'react';

interface VADOptions {
  enabled: boolean;
  threshold?: number;
  silenceDuration?: number;
  smoothingTimeConstant?: number;
}

export const useVAD = (options: VADOptions) => {
  const { enabled, threshold = 0.01, silenceDuration = 1000, smoothingTimeConstant = 0.8 } = options;
  
  const [isVoiceActivity, setIsVoiceActivity] = useState(false);
  const [volume, setVolume] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    setIsVoiceActivity(false);
    setVolume(0);
  }, []);

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !enabled) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate RMS (Root Mean Square) for volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / bufferLength);
    const normalizedVolume = rms / 255;
    
    setVolume(normalizedVolume);
    
    // Voice Activity Detection
    const hasVoiceActivity = normalizedVolume > threshold;
    
    if (hasVoiceActivity) {
      setIsVoiceActivity(true);
      
      // Clear any existing silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    } else {
      // Start silence timer only if we were previously detecting voice
      if (isVoiceActivity && !silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          setIsVoiceActivity(false);
          silenceTimerRef.current = null;
        }, silenceDuration);
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [enabled, threshold, silenceDuration, isVoiceActivity]);

  const startVAD = useCallback(async () => {
    if (!enabled) return;

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      
      // Create audio context
      audioContextRef.current = new AudioContext({
        sampleRate: 24000
      });
      
      // Create analyser
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = smoothingTimeConstant;
      
      // Connect stream to analyser
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Start analysis
      analyzeAudio();
      
    } catch (error) {
      console.error('Error starting VAD:', error);
      cleanup();
    }
  }, [enabled, smoothingTimeConstant, analyzeAudio, cleanup]);

  useEffect(() => {
    if (enabled) {
      startVAD();
    } else {
      cleanup();
    }
    
    return cleanup;
  }, [enabled, startVAD, cleanup]);

  return {
    isVoiceActivity,
    volume,
    startVAD,
    cleanup
  };
};