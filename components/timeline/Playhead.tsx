import React from 'react';
import { useEditor } from '../../hooks/useEditor';
import { useDraggable } from '../../hooks/useDraggable';

interface PlayheadProps {
    containerRef: React.RefObject<HTMLDivElement>;
}

export const Playhead: React.FC<PlayheadProps> = ({ containerRef }) => {
    const { state, dispatch } = useEditor();
    const { currentTime, isPlaying } = state.playback;
    const { pixelsPerSecond, duration } = state.timeline;
    
    const handleDrag = (dx: number, dy: number, clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const newTime = Math.max(0, Math.min(x / pixelsPerSecond, duration));
        dispatch({ type: 'SET_CURRENT_TIME', payload: newTime, meta: { skipHistory: true } });
    };

    const handleDragStart = () => {
      if (isPlaying) {
        dispatch({ type: 'SET_IS_PLAYING', payload: false, meta: { skipHistory: true } });
      }
    };

    const { handleMouseDown } = useDraggable({ onDrag: handleDrag, onDragStart: handleDragStart });
    
    const left = currentTime * pixelsPerSecond;

    return (
        <div 
            className="absolute top-0 h-full w-1 bg-indigo-500 rounded-full z-20 cursor-col-resize group"
            style={{ left: `${left}px` }}
            onMouseDown={handleMouseDown}
        >
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-indigo-500 border-2 border-gray-900 rounded-full group-hover:scale-125 transition-transform"></div>
        </div>
    );
};