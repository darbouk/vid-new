import React from 'react';
import { ToolPanel } from './ToolPanel';

interface BGPanelProps {
  onClose: () => void;
}

export const BGPanel: React.FC<BGPanelProps> = ({ onClose }) => {
  return (
    <ToolPanel title="Background" onClose={onClose}>
      <p className="text-sm text-gray-500">Adjust project background. Full controls coming soon!</p>
    </ToolPanel>
  );
};
