import React from 'react';

interface ImageAssetProps {
  src: string;
  alt: string;
}

export const ImageAsset: React.FC<ImageAssetProps> = ({ src, alt }) => {
  return (
    <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover" 
        loading="lazy"
      />
    </div>
  );
};
