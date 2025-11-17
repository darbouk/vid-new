import React, { useRef, useMemo } from 'react';
import { useEditor } from '../hooks/useEditor';
import { handleDrop } from '../app/actions/timelineActions';
import { TimelineHeader } from './timeline/TimelineHeader';
import { Track } from './timeline/Track';
import { Playhead } from './timeline/Playhead';
import { DND_TYPES } from '../lib/editor/types';
import { useLassoSelect } from '../hooks/useLassoSelect';

interface TimelineProps {
    onContextMenu: (event: React.MouseEvent, data: any) => void;
}

const TRACK_TOTAL_HEIGHT = 56; // h-12 (48px) + mt-2 (8px)

const Timeline: React.FC<TimelineProps> = ({ onContextMenu }) => {
    const { state, dispatch } = useEditor();
    const { timeline } = state;
    const timelineContainerRef = useRef<HTMLDivElement>(null);
    const tracksContainerRef = useRef<HTMLDivElement>(null);
    const [isDragOver, setIsDragOver] = React.useState(false);

    const clipsWithGeometry = useMemo(() => {
        const map = new Map<string, { x: number; y: number; width: number; height: number }>();
        timeline.tracks.forEach((track, trackIndex) => {
            track.clips.forEach(clipId => {
                const clip = timeline.clips[clipId];
                if (clip) {
                    map.set(clip.id, {
                        x: clip.start * timeline.pixelsPerSecond,
                        y: trackIndex * TRACK_TOTAL_HEIGHT,
                        width: clip.duration * timeline.pixelsPerSecond,
                        height: 48, // h-12
                    });
                }
            });
        });
        return map;
    }, [timeline.tracks, timeline.clips, timeline.pixelsPerSecond]);

    const handleLassoSelect = (selectedIds: string[], event: MouseEvent) => {
        if (event.shiftKey) {
            const currentSelection = new Set(state.selection.clips);
            selectedIds.forEach(id => currentSelection.add(id));
            dispatch({ type: 'SET_SELECTION', payload: Array.from(currentSelection) });
        } else {
            dispatch({ type: 'SET_SELECTION', payload: selectedIds });
        }
    };

    const { lassoRect } = useLassoSelect({
        containerRef: tracksContainerRef,
        allItems: clipsWithGeometry,
        onSelectionChange: handleLassoSelect,
    });

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        handleDrop(e, state, dispatch);
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const types = e.dataTransfer.types;
        if (types.includes(DND_TYPES.ASSET) || types.includes(DND_TYPES.CLIP)) {
            e.dataTransfer.dropEffect = 'copy';
            setIsDragOver(true);
        }
    };
    
    const onDragLeave = () => {
        setIsDragOver(false);
    };

  return (
    <div className="h-64 bg-[#121212] border-t border-gray-800 flex-shrink-0 p-3 flex flex-col">
        <TimelineHeader />
        <div 
            ref={timelineContainerRef}
            className="flex-grow flex items-start overflow-x-auto relative"
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            <div className="h-full w-24 flex-shrink-0">
                {timeline.tracks.map(track => (
                    <div key={track.id} className="h-12 flex items-center border-b border-gray-700 mt-2 px-3">
                         <span className="text-sm text-gray-300">{track.type}</span>
                    </div>
                ))}
            </div>
            <div 
                ref={tracksContainerRef}
                className="flex-grow h-full relative" 
                style={{ width: `${timeline.duration * timeline.pixelsPerSecond}px` }}
                onContextMenu={(e) => {
                    if (e.target === e.currentTarget) {
                        dispatch({ type: 'CLEAR_SELECTION' });
                    }
                }}
            >
                <TimelineHeader isRuler={true} />
                
                {timeline.tracks.map((track, index) => (
                    <Track key={track.id} track={track} index={index} onContextMenu={onContextMenu} />
                ))}

                <Playhead
                    containerRef={tracksContainerRef}
                />
                
                {isDragOver && (
                    <div className="absolute inset-0 bg-indigo-900/50 border-2 border-dashed border-indigo-400 rounded-lg pointer-events-none flex items-center justify-center">
                         <span className="text-indigo-300 font-semibold">Drop to add to timeline</span>
                    </div>
                )}
                {lassoRect && (
                    <div
                        className="lasso-select-box"
                        style={{
                            left: lassoRect.x,
                            top: lassoRect.y,
                            width: lassoRect.width,
                            height: lassoRect.height,
                        }}
                    />
                )}
            </div>
        </div>
    </div>
  );
};

export default Timeline;