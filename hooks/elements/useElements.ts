import { useState, useCallback } from 'react';
import type { ElementClip } from '../../lib/elements/types';

export const useElementsOnTimeline = (initialClips: ElementClip[] = []) => {
  const [elementClips, setElementClips] = useState<ElementClip[]>(initialClips);

  const addElementClip = useCallback((clip: Omit<ElementClip, 'id' | 'track'>) => {
    const newClip: ElementClip = {
      ...clip,
      id: `element-${Date.now()}`,
      track: 2, // Simple track assignment
    };
    setElementClips(prev => [...prev, newClip]);
  }, []);

  const updateElementClip = useCallback((updatedClip: ElementClip) => {
    setElementClips(prev => prev.map(c => c.id === updatedClip.id ? updatedClip : c));
  }, []);

  const removeElementClip = useCallback((clipId: string) => {
    setElementClips(prev => prev.filter(c => c.id !== clipId));
  }, []);

  return { elementClips, addElementClip, updateElementClip, removeElementClip };
};
