import React from 'react';
import { useSelection } from '../../hooks/useSelection';
import { useEditor } from '../../hooks/useEditor';
import { InspectorField } from './InspectorField';
import { updateClip } from '../../app/actions/timelineActions';
import type { AnyClip, VideoClip, AudioClip, TextClip, ElementClip } from '../../lib/timeline';
import { FONT_FAMILIES } from '../../data/text';
import { UndoIcon } from '../icons/Icons';

const availableFilters = ['none', 'grayscale(100%)', 'sepia(100%)', 'invert(100%)', 'brightness(1.5)', 'contrast(1.5)'];

const InspectorSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <details className="border-b border-gray-200" open>
        <summary className="font-semibold text-md text-gray-800 py-3 px-4 cursor-pointer hover:bg-gray-50 list-none flex justify-between items-center">
            {title}
            <span className="text-gray-400 transform transition-transform duration-200 ease-in-out ui-open:rotate-90">›</span>
        </summary>
        <div className="p-4 space-y-4 bg-white">
            {children}
        </div>
    </details>
);

const ResetButton = ({ onClick }: {onClick: () => void}) => (
    <button onClick={onClick} title="Reset to default" className="text-gray-400 hover:text-gray-600 p-1">
        <UndoIcon className="w-4 h-4"/>
    </button>
);


export const InspectorPanel: React.FC = () => {
  const { selectedClips, hasSelection } = useSelection();
  const { state, dispatch } = useEditor();

  if (!hasSelection) {
    return (
        <aside className="w-80 h-full bg-gray-50 border-l border-gray-200 flex-shrink-0 p-4">
             <h3 className="text-lg font-bold text-gray-800">Inspector</h3>
             <p className="text-sm text-gray-500 mt-2">
                Select a clip on the timeline to see its properties.
            </p>
        </aside>
    )
  }

  const handleUpdate = (updates: Partial<AnyClip>) => {
    selectedClips.forEach(clip => {
        // Basic type check to prevent applying incompatible properties
        if (updates.type && clip.type !== updates.type) return;
        updateClip(dispatch, clip.id, updates);
    });
  };
  
  // FIX: Changed key type from `keyof AnyClip` to `string` to allow accessing properties
  // that are not common to all clip types (e.g., 'volume', 'speed', 'filter').
  // Type safety is maintained by checks within the render functions.
  const getCommonValue = <T,>(key: string): T | undefined => {
      const firstValue = (selectedClips[0] as any)[key];
      if (selectedClips.every(clip => JSON.stringify((clip as any)[key]) === JSON.stringify(firstValue))) {
          return firstValue;
      }
      return undefined;
  };
  
  const getCommonNestedValue = <T,>(path: string[]): T | undefined => {
      const firstValue = path.reduce((obj, key) => obj?.[key], selectedClips[0]);
      if (selectedClips.every(clip => JSON.stringify(path.reduce((obj, key) => obj?.[key], clip)) === JSON.stringify(firstValue))) {
          return firstValue as T;
      }
      return undefined;
  };

  const handleNestedUpdate = (path: string[], value: any) => {
    selectedClips.forEach(clip => {
        const newClip = JSON.parse(JSON.stringify(clip)); // Deep copy
        let current = newClip;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        current[path[path.length-1]] = value;
        const rootKey = path[0] as keyof AnyClip;
        updateClip(dispatch, clip.id, { [rootKey]: newClip[rootKey] });
    });
  };

  const renderVideoControls = () => {
    const isMultiSelect = selectedClips.length > 1;
    const isAllVideo = selectedClips.every(c => c.type === 'video');
    if (!isAllVideo) return null;
    
    return (
        <>
            <InspectorSection title="Transform">
                 <div className="grid grid-cols-2 gap-4">
                    <InspectorField label="Scale">
                        <div className="flex items-center gap-2">
                         <input type="range" min="0.1" max="3" step="0.01" value={getCommonNestedValue(['transform', 'scale']) ?? 1} onChange={e => handleNestedUpdate(['transform', 'scale'], parseFloat(e.target.value))} className="w-full" />
                         <span className="text-xs w-10 text-right">{(getCommonNestedValue<number>(['transform', 'scale']) ?? 1).toFixed(2)}</span>
                        </div>
                    </InspectorField>
                     <InspectorField label="Rotation">
                        <div className="flex items-center gap-2">
                         <input type="range" min="-180" max="180" step="1" value={getCommonNestedValue(['transform', 'rotation']) ?? 0} onChange={e => handleNestedUpdate(['transform', 'rotation'], parseInt(e.target.value))} className="w-full" />
                         <span className="text-xs w-10 text-right">{getCommonNestedValue<number>(['transform', 'rotation']) ?? 0}°</span>
                        </div>
                    </InspectorField>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <InspectorField label="Position X">
                         <input type="number" step="1" value={getCommonNestedValue(['transform', 'position', 'x']) ?? 0} onChange={e => handleNestedUpdate(['transform', 'position', 'x'], parseInt(e.target.value))} className="w-full p-1 bg-gray-100 border rounded-md" />
                     </InspectorField>
                      <InspectorField label="Position Y">
                         <input type="number" step="1" value={getCommonNestedValue(['transform', 'position', 'y']) ?? 0} onChange={e => handleNestedUpdate(['transform', 'position', 'y'], parseInt(e.target.value))} className="w-full p-1 bg-gray-100 border rounded-md" />
                     </InspectorField>
                </div>
                <ResetButton onClick={() => handleNestedUpdate(['transform'], { scale: 1, rotation: 0, position: { x: 0, y: 0 } })} />
            </InspectorSection>
             <InspectorSection title="Crop">
                <div className="grid grid-cols-2 gap-4">
                     <InspectorField label="Left">
                         <input type="range" min="0" max="50" step="1" value={getCommonNestedValue(['crop', 'left']) ?? 0} onChange={e => handleNestedUpdate(['crop', 'left'], parseInt(e.target.value))} className="w-full" />
                     </InspectorField>
                     <InspectorField label="Right">
                         <input type="range" min="0" max="50" step="1" value={getCommonNestedValue(['crop', 'right']) ?? 0} onChange={e => handleNestedUpdate(['crop', 'right'], parseInt(e.target.value))} className="w-full" />
                     </InspectorField>
                     <InspectorField label="Top">
                         <input type="range" min="0" max="50" step="1" value={getCommonNestedValue(['crop', 'top']) ?? 0} onChange={e => handleNestedUpdate(['crop', 'top'], parseInt(e.target.value))} className="w-full" />
                     </InspectorField>
                     <InspectorField label="Bottom">
                         <input type="range" min="0" max="50" step="1" value={getCommonNestedValue(['crop', 'bottom']) ?? 0} onChange={e => handleNestedUpdate(['crop', 'bottom'], parseInt(e.target.value))} className="w-full" />
                     </InspectorField>
                </div>
                 <ResetButton onClick={() => handleNestedUpdate(['crop'], { top: 0, right: 0, bottom: 0, left: 0 })} />
            </InspectorSection>
            <InspectorSection title="Filter">
                <InspectorField label="Effect">
                    <select value={getCommonValue<string>('filter') || 'none'} onChange={e => handleUpdate({ filter: e.target.value } as Partial<VideoClip>)} className="w-full p-2 bg-gray-100 border rounded-md">
                        {availableFilters.map(f => <option key={f} value={f}>{f.split('(')[0]}</option>)}
                    </select>
                </InspectorField>
            </InspectorSection>
        </>
    )
  }
  
  const renderAudioControls = () => {
    const isAllAudible = selectedClips.every(c => c.type === 'video' || c.type === 'audio');
    if (!isAllAudible) return null;

    return (
        <InspectorSection title="Audio">
            <InspectorField label="Volume">
                <div className="flex items-center gap-2">
                    <input type="range" min="0" max="1" step="0.01" value={getCommonValue<number>('volume') ?? 1} onChange={e => handleUpdate({ volume: parseFloat(e.target.value) } as Partial<AnyClip>)} className="w-full" />
                    <span className="text-sm font-mono text-gray-600 w-12 text-center">{Math.round((getCommonValue<number>('volume') ?? 1) * 100)}%</span>
                </div>
            </InspectorField>
        </InspectorSection>
    );
  }

  const renderSpeedControls = () => {
      const isAllVideo = selectedClips.every(c => c.type === 'video');
      if (!isAllVideo) return null;

      return (
        <InspectorSection title="Speed">
            <InspectorField label="Speed">
                <div className="flex items-center gap-2">
                    <input type="range" min="0.25" max="4" step="0.01" value={getCommonValue<number>('speed') ?? 1} onChange={e => handleUpdate({ speed: parseFloat(e.target.value) } as Partial<VideoClip>)} className="w-full" />
                    <span className="text-sm font-mono text-gray-600 w-12 text-center">{(getCommonValue<number>('speed') ?? 1).toFixed(2)}x</span>
                </div>
            </InspectorField>
        </InspectorSection>
      )
  }

  const firstClip = selectedClips[0];
  const asset = state.projectAssets.find(a => a.id === firstClip.assetId);

  return (
    <aside className="w-80 h-full bg-gray-50 border-l border-gray-200 flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 truncate">{selectedClips.length > 1 ? `${selectedClips.length} clips selected` : asset?.name || 'Clip'}</h3>
            <p className="text-sm text-gray-500">{firstClip.type}</p>
        </div>
        <div className="flex-grow overflow-y-auto">
            {renderVideoControls()}
            {renderAudioControls()}
            {renderSpeedControls()}
        </div>
    </aside>
  );
};
