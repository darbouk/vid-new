import React from 'react';
import type { TextClip } from '../../lib/timeline';
import { FONT_FAMILIES } from '../../data/text';
import { InspectorField } from './InspectorField';

interface TextInspectorProps {
  clip: TextClip;
  onUpdate: (updates: Partial<TextClip>) => void;
}

export const TextInspector: React.FC<TextInspectorProps> = ({ clip, onUpdate }) => {
    const handleStyleChange = (key: keyof TextClip['style'], value: any) => {
        onUpdate({ style: { ...clip.style, [key]: value } });
    };

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onUpdate({ [name]: parseFloat(value) || 0 });
    };

    return (
        <div className="p-4 space-y-4">
            <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Text Properties</h3>
            <InspectorField label="Content">
                <textarea
                    value={clip.text}
                    onChange={(e) => onUpdate({ text: e.target.value })}
                    className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                />
            </InspectorField>
            
            <InspectorField label="Font">
                <select
                    value={clip.style.fontFamily}
                    onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                    className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-800"
                >
                    {FONT_FAMILIES.map(font => (
                        <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>{font.name}</option>
                    ))}
                </select>
            </InspectorField>

            <div className="grid grid-cols-2 gap-4">
                <InspectorField label="Font Size">
                    <input
                        type="number"
                        min="1"
                        value={clip.style.fontSize}
                        onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value, 10))}
                        className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </InspectorField>
                <InspectorField label="Color">
                    <input
                        type="color"
                        value={clip.style.color}
                        onChange={(e) => handleStyleChange('color', e.target.value)}
                        className="w-full h-10 p-1 bg-gray-100 border border-gray-300 rounded-md cursor-pointer"
                    />
                </InspectorField>
            </div>

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
        </div>
    );
};