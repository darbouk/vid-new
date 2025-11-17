import React from 'react';
import { ToolPanel } from './ToolPanel';

interface TrimPanelProps {
  onClose: () => void;
}

export const TrimPanel: React.FC<TrimPanelProps> = ({ onClose }) => {
  return (
    <ToolPanel title="Trim" onClose={onClose}>
      <p className="text-sm text-gray-500">Precisely trim clip start and end points. Full controls coming soon!</p>
    </ToolPanel>
  );
};
