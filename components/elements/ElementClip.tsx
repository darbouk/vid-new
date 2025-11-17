import React from 'react';
import { ElementClip as ElementClipType } from '../../lib/timeline';
import { useEditor } from '../../hooks/useEditor';

interface ElementClipProps {
  clip: ElementClipType;
}

export const ElementClip: React.FC<ElementClipProps> = ({ clip }) => {
    const { state } = useEditor();
    // In a real app, element assets would also be in the projectAssets
    // For now, we'll just show a generic name.
  return (
    <div className="w-full h-full bg-yellow-500 rounded-lg flex items-center px-2 overflow-hidden">
      <span className="text-black text-xs font-medium truncate pointer-events-none">
        Element
      </span>
    </div>
  );
};