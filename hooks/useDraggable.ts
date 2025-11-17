import React, { useRef, useCallback } from 'react';

interface UseDraggableOptions {
  onDragStart?: () => void;
  onDrag: (dx: number, dy: number, x: number, y: number) => void;
  onDragEnd?: (dx: number, dy: number) => void;
}

export const useDraggable = ({ onDragStart, onDrag, onDragEnd }: UseDraggableOptions) => {
  const startPos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    e.stopPropagation();
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    onDrag(dx, dy, e.clientX, e.clientY);
  }, [onDrag]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    onDragEnd?.(dx, dy);
  }, [handleMouseMove, onDragEnd]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isDragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    onDragStart?.();
  }, [handleMouseMove, handleMouseUp, onDragStart]);

  return { handleMouseDown };
};