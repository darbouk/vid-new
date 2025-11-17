import React from 'react';
import { ToolPanel } from './ToolPanel';

interface FilterPanelProps {
  onClose: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onClose }) => {
  return (
    <ToolPanel title="Filters" onClose={onClose}>
      <p className="text-sm text-gray-500">Apply filters to clip. Full controls coming soon!</p>
    </ToolPanel>
  );
};
