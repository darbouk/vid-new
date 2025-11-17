import React from 'react';
import type { TextClip } from '../../lib/timeline';

interface TextEditorProps {
  clip: TextClip;
  onUpdate: (updatedClip: Partial<TextClip>) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({ clip, onUpdate }) => {
  const handleStyleChange = (key: keyof TextClip['style'], value: any) => {
    onUpdate({ style: { ...clip.style, [key]: value } });
  };
  
  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Text Properties</h3>
      <div>
        <label className="text-sm font-medium text-gray-600 block mb-1">Content</label>
        <textarea
          value={clip.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="w-full p-2 mt-1 bg-gray-100 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Font Size</label>
            <input
            type="number"
            value={clip.style.fontSize}
            onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value, 10))}
            className="w-full p-2 mt-1 bg-gray-100 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
        </div>
        <div>
            <label className="text-sm font-medium text-gray-600 block mb-1">Color</label>
            <input
            type="color"
            value={clip.style.color}
            onChange={(e) => handleStyleChange('color', e.target.value)}
            className="w-full p-1 h-10 mt-1 bg-gray-100 border border-gray-300 rounded-md cursor-pointer"
            />
        </div>
      </div>
    </div>
  );
};