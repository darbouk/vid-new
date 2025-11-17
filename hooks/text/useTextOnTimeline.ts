import { useState, useCallback } from 'react';
import type { TextClip } from '../../lib/text/types';

export const useTextOnTimeline = (initialClips: TextClip[] = []) => {
  const [textClips, setTextClips] = useState<TextClip[]>(initialClips);

  const addTextClip = useCallback((clip: Omit<TextClip, 'id' | 'track'>) => {
    const newClip: TextClip = {
      ...clip,
      id: `text-${Date.now()}`,
      track: 1, // Simple track assignment for now
    };
    setTextClips(prev => [...prev, newClip]);
  }, []);

  const updateTextClip = useCallback((updatedClip: TextClip) => {
    setTextClips(prev => prev.map(c => c.id === updatedClip.id ? updatedClip : c));
  }, []);

  const removeTextClip = useCallback((clipId: string) => {
    setTextClips(prev => prev.filter(c => c.id !== clipId));
  }, []);

  return { textClips, addTextClip, updateTextClip, removeTextClip };
};
