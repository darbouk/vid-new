import React from 'react';
import type { ElementAsset } from '../../lib/elements/types';
import { SquareIcon, CircleIcon, TriangleIcon, StarIcon } from '../icons/Icons';

interface ElementAssetProps {
  asset: ElementAsset;
  onClick: (asset: ElementAsset) => void;
}

export const ElementAssetComponent: React.FC<ElementAssetProps> = ({ asset, onClick }) => {
  const renderAsset = () => {
    switch(asset.type) {
      case 'shape':
        if (asset.src === 'square') return <SquareIcon className="w-10 h-10 text-gray-600" />;
        if (asset.src === 'circle') return <CircleIcon className="w-10 h-10 text-gray-600" />;
        if (asset.src === 'triangle') return <TriangleIcon className="w-10 h-10 text-gray-600" />;
        if (asset.src === 'star') return <StarIcon className="w-10 h-10 text-gray-600" />;
        return null;
      case 'sticker':
        return <img src={asset.src} alt={asset.name} className="w-full h-full object-cover rounded-lg" />;
      default:
        return null;
    }
  }

  return (
    <button 
      onClick={() => onClick(asset)}
      className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
    >
      {renderAsset()}
      <span className="text-xs text-gray-500">{asset.name}</span>
    </button>
  );
};
