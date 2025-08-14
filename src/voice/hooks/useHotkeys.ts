import { useEffect, useCallback } from 'react';

interface HotkeyOptions {
  enabled: boolean;
  onToggleOverlay?: () => void;
  onPushToTalkStart?: () => void;
  onPushToTalkEnd?: () => void;
}

export const useHotkeys = (options: HotkeyOptions) => {
  const { enabled, onToggleOverlay, onPushToTalkStart, onPushToTalkEnd } = options;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ctrl+Shift+L - Toggle overlay
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyL') {
      event.preventDefault();
      onToggleOverlay?.();
      return;
    }

    // Space - Push to talk (start)
    if (event.code === 'Space' && !event.repeat) {
      // Only if not in input field
      const target = event.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
        event.preventDefault();
        onPushToTalkStart?.();
      }
    }
  }, [enabled, onToggleOverlay, onPushToTalkStart]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Space - Push to talk (end)
    if (event.code === 'Space') {
      const target = event.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
        event.preventDefault();
        onPushToTalkEnd?.();
      }
    }
  }, [enabled, onPushToTalkEnd]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled, handleKeyDown, handleKeyUp]);

  return {
    // No return values needed for this hook
  };
};