import React from 'react';
import type { VideoClip } from '../../lib/timeline';
import { useEditor } from '../../hooks/useEditor';
import { InspectorField } from './InspectorField';

interface VideoInspectorProps {
  clip: VideoClip;
  onUpdate: (updates: Partial<VideoClip>) => void;
}

export const VideoInspector: React.FC<VideoInspectorProps> = ({ clip, onUpdate }) => {
    const { state } = useEditor();
    const asset = state.projectAssets.find(a => a.id === clip.assetId);

    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onUpdate({ [name]: parseFloat(value) || 0 });
    };

    return (
         <div className="p-4 space-y-4">
            <h3 className="font-semibold text-lg text-gray-800 border-b pb-2">Video Properties</h3>
             <p className="text-sm text-gray-700 truncate">
                <span className="font-medium">File:</span> {asset?.name || 'Unknown'}
            </p>

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

            <InspectorField label="Speed">
                <div className="flex items-center gap-2">
                    <input
                        type="range"
                        name="speed"
                        min="0.25"
                        max="4"
                        step="0.01"
                        value={clip.speed}
                        onChange={handleNumericChange}
                        className="w-full"
                    />
                    <span className="text-sm font-mono text-gray-600 w-12 text-center">{clip.speed.toFixed(2)}x</span>
                </div>
            </InspectorField>

            <InspectorField label="Volume">
                <div className="flex items-center gap-2">
                    <input
                        type="range"
                        name="volume"
                        min="0"
                        max="1"
                        step="0.01"
                        value={clip.volume}
                        onChange={handleNumericChange}
                        className="w-full"
                    />
                    <span className="text-sm font-mono text-gray-600 w-12 text-center">{Math.round(clip.volume * 100)}%</span>
                </div>
            </InspectorField>
        </div>
    );
};