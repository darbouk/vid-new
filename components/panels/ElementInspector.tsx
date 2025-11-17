import React from 'react';
import type { ElementClip } from '../../lib/timeline';
import { InspectorField } from './InspectorField';

interface ElementInspectorProps {
  clip: ElementClip;
  onUpdate: (updates: Partial<ElementClip>) => void;
}

export const ElementInspector: React.FC<ElementInspectorProps> = ({ clip, onUpdate }) => {
    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onUpdate({ [name]: parseFloat(value) || 0 });
    };

    return (
        <div className="p-4 space-y-4">
            <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Element Properties</h3>
            
            <InspectorField label="Duration (s)">
                <input
                    type="number"
                    name="duration"
                    value={clip.duration.toFixed(2)}
                    onChange={handleNumericChange}
                    step="0.01"
                    min="0.1"
                    className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
            </InspectorField>

            <p className="text-sm text-gray-500">More element controls coming soon.</p>
        </div>
    );
};