import React from 'react';
import { XIcon } from '../../icons/Icons';

interface ToolPanelProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const ToolPanel: React.FC<ToolPanelProps> = ({ title, onClose, children }) => {
  return (
    <div className="w-64 bg-white/80 backdrop-blur-md rounded-lg shadow-2xl border border-gray-200 transform transition-all">
      <div className="flex justify-between items-center p-3 border-b border-gray-200">
        <h3 className="text-md font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <XIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};
