import React, { useRef } from 'react';
import { AnyClip } from '../../lib/timeline';
import { useEditor } from '../../hooks/useEditor';
import { useSelection } from '../../hooks/useSelection';
import { useDraggable } from '../../hooks/useDraggable';
import { DND_TYPES } from '../../lib/editor';
import { updateClip } from '../../app/actions/timelineActions';

interface ClipProps {
  clip: AnyClip;
  children: React.ReactNode;
  onContextMenu: (event: React.MouseEvent, data: any) => void;
}

export const Clip: React.FC<ClipProps> = ({ clip, children, onContextMenu }) => {
  const { state, dispatch } = useEditor();
  const { selectedClipIds, setSelection } = useSelection();
  const { pixelsPerSecond } = state.timeline;

  const isSelected = selectedClipIds.includes(clip.id);
  const originalClipRef = useRef<AnyClip | null>(null);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelection(clip.id, e.metaKey || e.ctrlKey);
  };

  const { handleMouseDown: handleDragMouseDown } = useDraggable({
    onDragStart: () => {
        originalClipRef.current = state.timeline.clips[clip.id];
    },
    onDrag: (dx) => {
        if (!originalClipRef.current) return;
        const newStart = Math.max(0, originalClipRef.current.start + dx / pixelsPerSecond);
        updateClip(dispatch, clip.id, { start: newStart }, true);
    },
    onDragEnd: (dx) => {
        if (!originalClipRef.current) return;
        const originalStart = originalClipRef.current.start;
        const newStart = Math.max(0, originalStart + dx / pixelsPerSecond);
        // Revert to original state for a clean history entry, then apply final state
        updateClip(dispatch, clip.id, { start: originalStart }, true);
        updateClip(dispatch, clip.id, { start: newStart }, false);
        originalClipRef.current = null;
    }
  });

  const { handleMouseDown: handleLeftResizeDown } = useDraggable({
    onDragStart: () => {
        originalClipRef.current = state.timeline.clips[clip.id];
    },
    onDrag: (dx) => {
        if (!originalClipRef.current) return;
        const delta = dx / pixelsPerSecond;
        const newStart = Math.max(0, originalClipRef.current.start + delta);
        const newDuration = Math.max(0.1, originalClipRef.current.duration - delta);
        updateClip(dispatch, clip.id, { start: newStart, duration: newDuration }, true);
    },
    onDragEnd: (dx) => {
        if (!originalClipRef.current) return;
        const delta = dx / pixelsPerSecond;
        const { start, duration } = originalClipRef.current;
        const newStart = Math.max(0, start + delta);
        const newDuration = Math.max(0.1, duration - delta);
        updateClip(dispatch, clip.id, { start, duration }, true);
        updateClip(dispatch, clip.id, { start: newStart, duration: newDuration }, false);
        originalClipRef.current = null;
    }
  });
  
  const { handleMouseDown: handleRightResizeDown } = useDraggable({
    onDragStart: () => {
        originalClipRef.current = state.timeline.clips[clip.id];
    },
    onDrag: (dx) => {
        if (!originalClipRef.current) return;
        const newDuration = Math.max(0.1, originalClipRef.current.duration + dx / pixelsPerSecond);
        updateClip(dispatch, clip.id, { duration: newDuration }, true);
    },
    onDragEnd: (dx) => {
        if (!originalClipRef.current) return;
        const { duration } = originalClipRef.current;
        const newDuration = Math.max(0.1, duration + dx / pixelsPerSecond);
        updateClip(dispatch, clip.id, { duration }, true);
        updateClip(dispatch, clip.id, { duration: newDuration }, false);
        originalClipRef.current = null;
    }
  });

  const left = clip.start * pixelsPerSecond;
  const width = clip.duration * pixelsPerSecond;
  
  return (
    <div
      className={`group absolute top-0 h-full rounded-lg flex items-center border-2 z-10 ${isSelected ? 'border-indigo-500 bg-opacity-40' : 'border-transparent'}`}
      style={{ left: `${left}px`, width: `${width}px` }}
      onClick={handleSelect}
      onContextMenu={(e) => onContextMenu(e, { clipId: clip.id })}
      onMouseDown={handleDragMouseDown}
      draggable="true"
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData(DND_TYPES.CLIP, JSON.stringify(clip));
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      {isSelected && (
        <>
            <div 
                className="resize-handle left"
                onMouseDown={handleLeftResizeDown}
            />
            <div 
                className="resize-handle right"
                onMouseDown={handleRightResizeDown}
            />
        </>
      )}
      <div className="w-full h-full relative overflow-hidden rounded-md">
        {children}
      </div>
    </div>
  );
};