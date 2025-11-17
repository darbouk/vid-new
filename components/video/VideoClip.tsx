import React from 'react';
import { VideoClip as VideoClipType } from '../../lib/timeline';
import { useEditor } from '../../hooks/useEditor';
import { SpeedIcon, FilterIcon, TransformIcon } from '../icons/Icons'; // Assuming TransformIcon exists or is created

const EffectIndicator: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => (
    <div className="w-4 h-4 text-white" title={label}>{icon}</div>
);

export const VideoClip: React.FC<VideoClipType> = ({ clip }) => {
    const { state } = useEditor();
    const asset = state.projectAssets.find(a => a.id === clip.assetId);

    const hasSpeedEffect = clip.speed !== 1;
    const hasFilterEffect = clip.filter !== null;
    const hasTransformEffect = clip.transform.scale !== 1 || clip.transform.rotation !== 0 || clip.transform.position.x !== 0 || clip.transform.position.y !== 0;


  return (
    <div className="w-full h-full bg-pink-600 rounded-lg flex flex-col justify-between px-2 py-1 overflow-hidden">
      <span className="text-white text-xs font-medium truncate pointer-events-none self-start">
        {asset?.name || 'Video Clip'}
      </span>
      <div className="flex gap-1.5 self-end">
        {hasSpeedEffect && <EffectIndicator icon={<SpeedIcon />} label={`Speed: ${clip.speed}x`} />}
        {hasFilterEffect && <EffectIndicator icon={<FilterIcon />} label={`Filter: ${clip.filter}`} />}
        {hasTransformEffect && <EffectIndicator icon={<TransformIcon />} label="Transform Applied" />}
      </div>
    </div>
  );
};
