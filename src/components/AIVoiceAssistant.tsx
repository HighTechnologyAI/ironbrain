import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Phone, 
  PhoneOff,
  MessageSquare,
  Brain,
  Zap,
  Activity,
  Settings,
  Headphones,
  RadioTower
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type: 'text' | 'audio' | 'function_call';
  audioUrl?: string;
  functionCall?: {
    name: string;
    arguments: any;
    result?: any;
  };
}

interface AudioRecorder {
  stream: MediaStream | null;
  audioContext: AudioContext | null;
  processor: ScriptProcessorNode | null;
  source: MediaStreamAudioSourceNode | null;
  start(): Promise<void>;
  stop(): void;
}

class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      const wavData = this.createWavFromPCM(audioData);
      const arrayBuffer = new ArrayBuffer(wavData.byteLength);
      new Uint8Array(arrayBuffer).set(wavData);
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => this.playNext();
      source.start(0);
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext();
    }
  }

  private createWavFromPCM(pcmData: Uint8Array): Uint8Array {
    const int16Data = new Int16Array(pcmData.length / 2);
    for (let i = 0; i < pcmData.length; i += 2) {
      int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
    }
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + int16Data.byteLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, int16Data.byteLength, true);

    const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(new Uint8Array(int16Data.buffer), wavHeader.byteLength);
    
    return wavArray;
  }
}

const AIVoiceAssistant: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [currentTranscript, setCurrentTranscript] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);

  const encodeAudioForAPI = (float32Array: Float32Array): string => {
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
  };

  const createAudioRecorder = (onAudioData: (audioData: Float32Array) => void): AudioRecorder => {
    return {
      stream: null,
      audioContext: null,
      processor: null,
      source: null,
      
      async start() {
        try {
          this.stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              sampleRate: 24000,
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          
          this.audioContext = new AudioContext({ sampleRate: 24000 });
          this.source = this.audioContext.createMediaStreamSource(this.stream);
          this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
          
          this.processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            onAudioData(new Float32Array(inputData));
          };
          
          this.source.connect(this.processor);
          this.processor.connect(this.audioContext.destination);
        } catch (error) {
          console.error('Error accessing microphone:', error);
          throw error;
        }
      },
      
      stop() {
        if (this.source) {
          this.source.disconnect();
          this.source = null;
        }
        if (this.processor) {
          this.processor.disconnect();
          this.processor = null;
        }
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
        if (this.audioContext) {
          this.audioContext.close();
          this.audioContext = null;
        }
      }
    };
  };

  const setupWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setConnectionStatus('connecting');
    console.log('Connecting to WebSocket...');

    // Use the full URL to the Supabase edge function
    const wsUrl = 'wss://zqnjgwrvvrqaenzmlvfx.functions.supabase.co/ai-voice-assistant';
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setConnectionStatus('connected');
      setIsConnected(true);
      toast.success('Voice assistant connected');
    };

    wsRef.current.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received message:', data.type);

        switch (data.type) {
          case 'session.created':
            console.log('Session created');
            break;

          case 'session.updated':
            console.log('Session updated');
            break;

          case 'response.audio.delta':
            if (!isMuted && audioQueueRef.current) {
              const binaryString = atob(data.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              await audioQueueRef.current.addToQueue(bytes);
            }
            break;

          case 'response.audio_transcript.delta':
            setCurrentTranscript(prev => prev + data.delta);
            break;

          case 'response.audio_transcript.done':
            if (currentTranscript) {
              const newMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: currentTranscript,
                timestamp: new Date().toISOString(),
                type: 'text'
              };
              setMessages(prev => [...prev, newMessage]);
              setCurrentTranscript('');
            }
            break;

          case 'conversation.item.input_audio_transcription.completed':
            if (data.transcript) {
              const newMessage: Message = {
                id: Date.now().toString(),
                role: 'user',
                content: data.transcript,
                timestamp: new Date().toISOString(),
                type: 'text'
              };
              setMessages(prev => [...prev, newMessage]);
            }
            break;

          case 'response.function_call_arguments.done':
            console.log('Function call:', data.name, data.arguments);
            const functionMessage: Message = {
              id: Date.now().toString(),
              role: 'assistant',
              content: `Called function: ${data.name}`,
              timestamp: new Date().toISOString(),
              type: 'function_call',
              functionCall: {
                name: data.name,
                arguments: JSON.parse(data.arguments || '{}')
              }
            };
            setMessages(prev => [...prev, functionMessage]);
            break;

          case 'error':
            console.error('AI Error:', data);
            toast.error(`AI Error: ${data.error?.message || 'Unknown error'}`);
            break;

          default:
            console.log('Unhandled message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
      toast.error('Voice assistant connection error');
    };

    wsRef.current.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setConnectionStatus('disconnected');
      setIsConnected(false);
      
      if (event.code !== 1000) {
        toast.error('Voice assistant disconnected');
      }
    };
  };

  const startRecording = async () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error('Not connected to voice assistant');
      return;
    }

    try {
      const recorder = createAudioRecorder((audioData: Float32Array) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const encodedAudio = encodeAudioForAPI(audioData);
          const message = {
            type: 'input_audio_buffer.append',
            audio: encodedAudio
          };
          wsRef.current.send(JSON.stringify(message));
        }
      });

      await recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const toggleConnection = () => {
    if (isConnected) {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (recorderRef.current) {
        recorderRef.current.stop();
        recorderRef.current = null;
      }
      setIsRecording(false);
    } else {
      setupWebSocket();
    }
  };

  const sendTextMessage = (text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error('Not connected to voice assistant');
      return;
    }

    const message = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    };

    wsRef.current.send(JSON.stringify(message));
    wsRef.current.send(JSON.stringify({ type: 'response.create' }));

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      type: 'text'
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    audioQueueRef.current = new AudioQueue(audioContextRef.current);

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (recorderRef.current) {
        recorderRef.current.stop();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500 text-white';
      case 'connecting': return 'bg-yellow-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      case 'disconnected': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <RadioTower className="h-3 w-3" />;
      case 'connecting': return <Activity className="h-3 w-3 animate-pulse" />;
      case 'error': return <Zap className="h-3 w-3" />;
      case 'disconnected': return <PhoneOff className="h-3 w-3" />;
      default: return <Phone className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Voice Assistant</h3>
          <p className="text-sm text-muted-foreground">
            Real-time voice communication with AI for UAV operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(connectionStatus)} variant="secondary">
            {getStatusIcon()}
            {connectionStatus}
          </Badge>
          <Button 
            onClick={toggleConnection}
            variant={isConnected ? "destructive" : "default"}
            size="sm"
            className="gap-2"
          >
            {isConnected ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
            {isConnected ? 'Disconnect' : 'Connect'}
          </Button>
        </div>
      </div>

      {/* Voice Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            Voice Controls
          </CardTitle>
          <CardDescription>
            Use voice commands to interact with the AI assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!isConnected}
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              className="gap-2 h-16 px-8"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-6 w-6" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-6 w-6" />
                  Start Recording
                </>
              )}
            </Button>

            <Button
              onClick={() => setIsMuted(!isMuted)}
              disabled={!isConnected}
              variant={isMuted ? "destructive" : "outline"}
              size="lg"
              className="gap-2 h-16 px-8"
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-6 w-6" />
                  Unmute
                </>
              ) : (
                <>
                  <Volume2 className="h-6 w-6" />
                  Mute
                </>
              )}
            </Button>
          </div>

          {isRecording && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-red-500">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Recording...</span>
              </div>
            </div>
          )}

          {currentTranscript && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <span className="text-sm font-medium text-primary">AI is speaking:</span>
              <p className="text-sm mt-1">{currentTranscript}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Quick Commands
          </CardTitle>
          <CardDescription>
            Common voice commands for UAV operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "What's the status of the fleet?",
              "Analyze the latest telemetry data",
              "Schedule maintenance for drone 3",
              "Optimize the current mission plan",
              "Check battery levels across all drones",
              "Generate a daily operations report"
            ].map((command, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-left justify-start h-auto py-2 px-3"
                onClick={() => sendTextMessage(command)}
                disabled={!isConnected}
              >
                <span className="text-xs">{command}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Conversation History
          </CardTitle>
          <CardDescription>
            Voice and text interactions with the AI assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-center">
                <div>
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start a voice conversation or use quick commands
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {message.role === 'user' ? 'You' : 'AI Assistant'}
                        </span>
                        {message.type === 'function_call' && (
                          <Badge variant="outline" className="text-xs">
                            Function Call
                          </Badge>
                        )}
                        <span className="text-xs opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                      {message.functionCall && (
                        <div className="mt-2 p-2 bg-background/10 rounded text-xs">
                          <span className="font-medium">Function:</span> {message.functionCall.name}
                          <br />
                          <span className="font-medium">Args:</span> {JSON.stringify(message.functionCall.arguments)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIVoiceAssistant;