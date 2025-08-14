import React from 'react';
import { createPortal } from 'react-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Settings, Volume2, VolumeX } from 'lucide-react';
import { useVoiceAssistant } from './VoiceAssistantProvider';
import './styles.css';

export const VoiceOverlay: React.FC = () => {
  const {
    enabled,
    listening,
    speaking,
    interimText,
    finalText,
    volume,
    mode,
    toggle,
    setMode,
    pushToTalkStart,
    pushToTalkEnd
  } = useVoiceAssistant();

  if (!enabled) return null;

  const overlay = (
    <div className="voice-overlay">
      <Card className="voice-overlay-card">
        <div className="voice-overlay-header">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="voice-close-btn"
          >
            ×
          </Button>
          
          <div className="voice-title">IronBrain Voice AI</div>
          
          <Button variant="ghost" size="sm" className="voice-settings-btn">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="voice-controls">
          <Button
            className={`voice-mic-btn ${listening ? 'listening' : ''}`}
            onMouseDown={mode === 'ptt' ? pushToTalkStart : undefined}
            onMouseUp={mode === 'ptt' ? pushToTalkEnd : undefined}
            onTouchStart={mode === 'ptt' ? pushToTalkStart : undefined}
            onTouchEnd={mode === 'ptt' ? pushToTalkEnd : undefined}
          >
            {listening ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>

          <div className="voice-vu-meter">
            <div 
              className="voice-vu-bar" 
              style={{ transform: `scaleY(${Math.min(volume * 10, 1)})` }}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="voice-speaker-btn"
          >
            {speaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>

        <div className="voice-transcript">
          {interimText && (
            <div className="voice-interim-text">{interimText}</div>
          )}
          {finalText && (
            <div className="voice-final-text">{finalText}</div>
          )}
          {!interimText && !finalText && (
            <div className="voice-placeholder">
              {mode === 'ptt' ? 'Hold Space to talk' : 'Say "IronBrain" to start'}
            </div>
          )}
        </div>

        <div className="voice-mode-switch">
          <Button
            variant={mode === 'ptt' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('ptt')}
          >
            Push to Talk
          </Button>
          <Button
            variant={mode === 'always' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('always')}
          >
            Always On
          </Button>
        </div>
      </Card>
    </div>
  );

  return createPortal(overlay, document.body);
};