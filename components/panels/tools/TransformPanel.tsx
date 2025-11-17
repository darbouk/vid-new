import React from 'react';
import { ToolPanel } from './ToolPanel';

interface TransformPanelProps {
  onClose: () => void;
}

export const TransformPanel: React.FC<TransformPanelProps> = ({ onClose }) => {
  return (
    <ToolPanel title="Transform" onClose={onClose}>
      <p className="text-sm text-gray-500">Rotate, scale, and position clip. Full controls coming soon!</p>
    </ToolPanel>
  );
};
