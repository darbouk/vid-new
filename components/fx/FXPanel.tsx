import React, { useState, useEffect, useRef } from 'react';
import { PHYSICS_TRANSITIONS } from '../../data/fx';
import type { AppliedFX } from '../../lib/fx';
import { XIcon } from '../icons/Icons';

interface FXPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (fx: AppliedFX) => void;
  anchorElement: HTMLElement | null;
}

const ParameterSlider: React.FC<{
    label: string;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, value, onChange }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <span className="text-sm text-gray-500 font-mono bg-gray-200 px-1.5 py-0.5 rounded">{value}</span>
        </div>
        <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
    </div>
);

export const FXPanel: React.FC<FXPanelProps> = ({ isOpen, onClose, onApply, anchorElement }) => {
  const [selectedTransitionId, setSelectedTransitionId] = useState<string | null>(PHYSICS_TRANSITIONS[0]?.id || null);
  const [intensity, setIntensity] = useState(50);
  const [speed, setSpeed] = useState(50);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (anchorElement) {
      const rect = anchorElement.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) && !anchorElement?.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, anchorElement, onClose]);

  if (!isOpen) {
    return null;
  }
  
  const handleApplyClick = () => {
    onApply({ transitionId: selectedTransitionId, intensity, speed });
  };
  
  const selectedTransition = PHYSICS_TRANSITIONS.find(t => t.id === selectedTransitionId);

  return (
    <div
      ref={panelRef}
      className="absolute z-30 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 transform transition-all"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="fx-panel-title"
    >
        <div className="flex justify-between items-center mb-4">
            <h2 id="fx-panel-title" className="text-lg font-bold text-gray-900">Physics Transitions</h2>
            <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                <XIcon className="w-5 h-5" />
            </button>
        </div>

        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Select Transition</h3>
                <div className="grid grid-cols-3 gap-2">
                    {PHYSICS_TRANSITIONS.map((transition) => (
                        <button
                            key={transition.id}
                            onClick={() => setSelectedTransitionId(transition.id)}
                            className={`p-2 flex flex-col items-center gap-1 rounded-lg border-2 transition-colors ${selectedTransitionId === transition.id ? 'border-indigo-500 bg-indigo-50' : 'border-transparent bg-gray-100 hover:bg-gray-200'}`}
                        >
                            <transition.icon className={`w-8 h-8 ${selectedTransitionId === transition.id ? 'text-indigo-600' : 'text-gray-500'}`} />
                            <span className={`text-xs font-medium ${selectedTransitionId === transition.id ? 'text-indigo-700' : 'text-gray-600'}`}>{transition.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {selectedTransition && (
                <div className="p-3 bg-gray-50 rounded-lg space-y-4 border border-gray-200">
                    <p className="text-sm text-gray-600">{selectedTransition.description}</p>
                    <ParameterSlider label="Intensity" value={intensity} onChange={(e) => setIntensity(parseInt(e.target.value, 10))} />
                    <ParameterSlider label="Speed" value={speed} onChange={(e) => setSpeed(parseInt(e.target.value, 10))} />
                </div>
            )}

            <button
                onClick={handleApplyClick}
                disabled={!selectedTransitionId}
                className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
                Apply Transition
            </button>
        </div>
    </div>
  );
};
