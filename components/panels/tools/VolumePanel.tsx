import React from 'react';
import { ToolPanel } from './ToolPanel';

interface VolumePanelProps {
  onClose: () => void;
}

export const VolumePanel: React.FC<VolumePanelProps> = ({ onClose }) => {
  return (
    <ToolPanel title="Volume" onClose={onClose}>
      <p className="text-sm text-gray-500">Adjust clip volume and audio channels. Full controls coming soon!</p>
    </ToolPanel>
  );
};
