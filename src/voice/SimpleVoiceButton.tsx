import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';
import { useVoice } from './VoiceManager';

export const SimpleVoiceButton: React.FC = () => {
  const { 
    isListening, 
    isSpeaking,
    currentProvider,
    startListening, 
    stopListening,
    config 
  } = useVoice();

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const button = (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <Button
        onClick={toggleListening}
        className={`
          w-16 h-16 rounded-full shadow-lg transition-all duration-300
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : isSpeaking 
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-primary hover:bg-primary-hover'
          }
        `}
        title={`Voice Assistant (${currentProvider}) - ${config.mode}`}
      >
        {isListening ? (
          <MicOff className="h-8 w-8 text-white" />
        ) : (
          <Mic className="h-8 w-8 text-white" />
        )}
      </Button>
      
      {(isListening || isSpeaking) && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg px-3 py-1 text-sm whitespace-nowrap">
          {isListening ? 'Говорите...' : 'IronBrain говорит...'}
        </div>
      )}
    </div>
  );

  return createPortal(button, document.body);
};