import React, { useEffect } from 'react';
import { AudioClip as AudioClipType } from '../../lib/timeline';
import { useEditor } from '../../hooks/useEditor';
import { Waveform } from './Waveform';
import { AudioAsset } from '../../lib/assets';

interface AudioClipProps {
  clip: AudioClipType;
}

export const AudioClip: React.FC<AudioClipProps> = ({ clip }) => {
    const { state } = useEditor();
    const asset = state.projectAssets.find(a => a.id === clip.assetId) as AudioAsset | undefined;
    
  return (
    <div className="w-full h-full bg-cyan-600 rounded-lg flex items-center px-2 overflow-hidden relative">
      {asset?.waveform && <Waveform data={asset.waveform} />}
      <span className="absolute top-1 left-2 text-white text-xs font-medium truncate pointer-events-none mix-blend-difference">
        {asset?.name || 'Audio Clip'}
      </span>
    </div>
  );
};
