import React from 'react';
import { TextClip as TextClipType } from '../../lib/timeline';

interface TextClipProps {
  clip: TextClipType;
}

export const TextClip: React.FC<TextClipProps> = ({ clip }) => {
  return (
    <div className="w-full h-full bg-purple-600 rounded-lg flex items-center px-2 overflow-hidden">
      <span className="text-white text-xs font-medium truncate pointer-events-none" style={{fontFamily: clip.style.fontFamily}}>
        {clip.text}
      </span>
    </div>
  );
};