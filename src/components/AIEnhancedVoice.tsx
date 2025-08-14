import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Volume2, 
  Play, 
  Pause, 
  Square,
  Download,
  Settings,
  Mic,
  Speaker,
  Zap
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Voice {
  id: string;
  name: string;
  description: string;
  category: 'male' | 'female' | 'neutral';
}

interface AudioState {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  audioUrl: string | null;
}

const AIEnhancedVoice: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('9BWtsMINqrJLrRacOk9x'); // Aria voice
  const [selectedModel, setSelectedModel] = useState('eleven_turbo_v2_5');
  const [stability, setStability] = useState([0.5]);
  const [similarity, setSimilarity] = useState([0.5]);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    audioUrl: null
  });
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const voices: Voice[] = [
    { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', description: 'Professional female voice', category: 'female' },
    { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', description: 'Confident male voice', category: 'male' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Clear female voice', category: 'female' },
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', description: 'Warm female voice', category: 'female' },
    { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', description: 'Friendly male voice', category: 'male' },
    { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Distinguished male voice', category: 'male' },
    { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', description: 'Young male voice', category: 'male' },
    { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Natural male voice', category: 'male' },
    { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', description: 'Elegant female voice', category: 'female' },
    { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', description: 'Friendly female voice', category: 'female' }
  ];

  const models = [
    { id: 'eleven_turbo_v2_5', name: 'Turbo v2.5', description: 'High quality, low latency' },
    { id: 'eleven_multilingual_v2', name: 'Multilingual v2', description: 'Most lifelike, 29 languages' },
    { id: 'eleven_turbo_v2', name: 'Turbo v2', description: 'English only, fastest' }
  ];

  const generateSpeechMutation = useMutation({
    mutationFn: async ({ text, voiceId, modelId }: { text: string, voiceId: string, modelId: string }) => {
      const { data, error } = await supabase.functions.invoke('ai-text-to-speech', {
        body: {
          text: text,
          voice_id: voiceId,
          model_id: modelId
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success && data.audio) {
        const audioBlob = new Blob([
          Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))
        ], { type: 'audio/mpeg' });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioState(prev => ({ ...prev, audioUrl }));
        
        toast.success('Speech generated successfully');
      } else {
        throw new Error(data.error || 'Failed to generate speech');
      }
    },
    onError: (error) => {
      console.error('Speech generation error:', error);
      toast.error('Failed to generate speech');
    }
  });

  const handleGenerateSpeech = () => {
    if (!text.trim()) {
      toast.error('Please enter some text to convert to speech');
      return;
    }

    generateSpeechMutation.mutate({
      text: text.trim(),
      voiceId: selectedVoice,
      modelId: selectedModel
    });
  };

  const handlePlayPause = () => {
    if (!audioState.audioUrl) return;

    if (!audioElement) {
      const audio = new Audio(audioState.audioUrl);
      audio.addEventListener('loadedmetadata', () => {
        setAudioState(prev => ({ ...prev, duration: audio.duration }));
      });
      
      audio.addEventListener('timeupdate', () => {
        setAudioState(prev => ({ ...prev, currentTime: audio.currentTime }));
      });
      
      audio.addEventListener('ended', () => {
        setAudioState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
      });
      
      setAudioElement(audio);
      audio.play();
      setAudioState(prev => ({ ...prev, isPlaying: true }));
    } else {
      if (audioState.isPlaying) {
        audioElement.pause();
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      } else {
        audioElement.play();
        setAudioState(prev => ({ ...prev, isPlaying: true }));
      }
    }
  };

  const handleStop = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setAudioState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    }
  };

  const handleDownload = () => {
    if (audioState.audioUrl) {
      const a = document.createElement('a');
      a.href = audioState.audioUrl;
      a.download = 'generated-speech.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const quickTexts = [
    "UAV mission status report: All drones operational and ready for deployment.",
    "Alert: Drone battery levels are critically low. Immediate landing required.",
    "Weather conditions are optimal for flight operations. Proceeding with scheduled missions.",
    "Maintenance completed on Drone Alpha. System checks passed. Ready for service.",
    "Emergency landing protocol activated. All drones returning to base immediately."
  ];

  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
      if (audioState.audioUrl) {
        URL.revokeObjectURL(audioState.audioUrl);
      }
    };
  }, [audioElement, audioState.audioUrl]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Enhanced Voice</h3>
          <p className="text-sm text-muted-foreground">
            High-quality text-to-speech using ElevenLabs AI voices
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Speaker className="h-3 w-3" />
          ElevenLabs
        </Badge>
      </div>

      {/* Voice Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice Selection
            </CardTitle>
            <CardDescription>
              Choose voice and model for speech generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Voice</label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{voice.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {voice.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {voices.find(v => v.id === selectedVoice)?.description}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-muted-foreground">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Voice Settings
            </CardTitle>
            <CardDescription>
              Fine-tune voice characteristics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Stability: {stability[0]}</label>
              <Slider
                value={stability}
                onValueChange={setStability}
                max={1}
                min={0}
                step={0.1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher values make speech more consistent
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Similarity: {similarity[0]}</label>
              <Slider
                value={similarity}
                onValueChange={setSimilarity}
                max={1}
                min={0}
                step={0.1}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher values make speech more similar to the original voice
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Text Input */}
      <Card>
        <CardHeader>
          <CardTitle>Text Input</CardTitle>
          <CardDescription>
            Enter text to convert to speech
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            className="min-h-32"
            maxLength={5000}
          />
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {text.length}/5000 characters
            </span>
            <Button
              onClick={handleGenerateSpeech}
              disabled={!text.trim() || generateSpeechMutation.isPending}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              {generateSpeechMutation.isPending ? 'Generating...' : 'Generate Speech'}
            </Button>
          </div>

          {/* Quick Text Options */}
          <div>
            <label className="text-sm font-medium">Quick Texts</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {quickTexts.map((quickText, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setText(quickText)}
                >
                  {quickText.substring(0, 30)}...
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Player */}
      {audioState.audioUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Generated Audio
            </CardTitle>
            <CardDescription>
              Play and download your generated speech
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={handlePlayPause}
                variant="default"
                size="lg"
                className="gap-2"
              >
                {audioState.isPlaying ? (
                  <>
                    <Pause className="h-5 w-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Play
                  </>
                )}
              </Button>

              <Button
                onClick={handleStop}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Square className="h-5 w-5" />
                Stop
              </Button>

              <Button
                onClick={handleDownload}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Download className="h-5 w-5" />
                Download
              </Button>
            </div>

            {audioState.duration > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{formatTime(audioState.currentTime)}</span>
                  <span>{formatTime(audioState.duration)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(audioState.currentTime / audioState.duration) * 100}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIEnhancedVoice;