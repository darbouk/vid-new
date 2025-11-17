// FIX: Added React import to resolve "Cannot find namespace 'React'" error.
import React, { useEffect, useRef } from 'react';

/**
 * Manages horizontal scrolling and panning of the timeline container.
 * This is a placeholder for more advanced scroll/pan logic.
 * @param containerRef Ref to the timeline scroll container.
 */
export const useTimelineScroll = (containerRef: React.RefObject<HTMLElement>) => {
    const handleWheel = (event: WheelEvent) => {
        if (containerRef.current && event.deltaY !== 0) {
            event.preventDefault();
            // Simple horizontal scroll with vertical mouse wheel
            containerRef.current.scrollLeft += event.deltaY;
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [containerRef]);
};