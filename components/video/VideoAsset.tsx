import React from 'react';

interface VideoAssetProps {
  src: string;
  title: string;
}

export const VideoAsset: React.FC<VideoAssetProps> = ({ src, title }) => {
  return (
    <div className="group relative aspect-video bg-black rounded-lg overflow-hidden">
      <video src={src} className="w-full h-full object-cover" muted loop />
      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-sm font-medium truncate">{title}</p>
      </div>
    </div>
  );
};
