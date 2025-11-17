import React from 'react';
// Assuming a SubtitleClip type would be defined in lib/timeline
// For now, we can create a placeholder.

interface SubtitleClipProps {
  // clip: SubtitleClipType;
  clip: any;
}

export const SubtitleClip: React.FC<SubtitleClipProps> = ({ clip }) => {
  return (
    <div className="w-full h-full bg-green-700 rounded-lg flex items-center px-2 overflow-hidden">
      <span className="text-white text-xs font-medium truncate pointer-events-none">
        {clip.text}
      </span>
    </div>
  );
};