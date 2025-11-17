import React from 'react';
import { ToolPanel } from './ToolPanel';

interface CropPanelProps {
  onClose: () => void;
}

export const CropPanel: React.FC<CropPanelProps> = ({ onClose }) => {
  return (
    <ToolPanel title="Crop" onClose={onClose}>
      <p className="text-sm text-gray-500">Crop selected clip. Full controls coming soon!</p>
    </ToolPanel>
  );
};
