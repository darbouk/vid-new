import React from 'react';
import { SubtitleCue } from '../../lib/subtitles/types';

interface SubtitleEditorProps {
  cues: SubtitleCue[];
  onCuesChange: (cues: SubtitleCue[]) => void;
  currentTime: number;
}

export const SubtitleEditor: React.FC<SubtitleEditorProps> = ({ cues, onCuesChange, currentTime }) => {
  return (
    <div className="space-y-2 max-h-60 overflow-y-auto p-1">
      {cues.map((cue, index) => {
        const isActive = currentTime >= cue.startTime && currentTime < cue.endTime;
        return (
            <div 
                key={cue.id} 
                className={`flex items-start gap-2 p-2 rounded-lg transition-colors ${isActive ? 'bg-indigo-100' : 'bg-gray-100'}`}
            >
              <div className="flex flex-col text-xs font-mono text-gray-500 text-center">
                  <span>{cue.startTime.toFixed(2)}</span>
                  <span>|</span>
                  <span>{cue.endTime.toFixed(2)}</span>
              </div>
              <textarea 
                value={cue.text}
                rows={2}
                onChange={(e) => {
                    const newCues = [...cues];
                    newCues[index] = { ...newCues[index], text: e.target.value };
                    onCuesChange(newCues);
                }}
                className="w-full bg-white border border-gray-300 rounded p-1 text-sm resize-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
        )
      })}
    </div>
  );
};
