import React from 'react';
import { ToolPanel } from './ToolPanel';

interface SpeedPanelProps {
  onClose: () => void;
}

export const SpeedPanel: React.FC<SpeedPanelProps> = ({ onClose }) => {
  return (
    <ToolPanel title="Speed" onClose={onClose}>
      <p className="text-sm text-gray-500">Adjust clip speed. Full controls coming soon!</p>
    </ToolPanel>
  );
};
