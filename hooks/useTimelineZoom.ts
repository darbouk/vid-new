import { useCallback } from 'react';
import { useEditor } from './useEditor';

export const useTimelineZoom = () => {
    const { state, dispatch } = useEditor();
    const { pixelsPerSecond } = state.timeline;

    const setPixelsPerSecond = useCallback((value: number) => {
        dispatch({ type: 'SET_PIXELS_PER_SECOND', payload: value, meta: { skipHistory: true } });
    }, [dispatch]);

    const zoomIn = useCallback(() => {
        setPixelsPerSecond(Math.min(pixelsPerSecond * 1.25, 250));
    }, [pixelsPerSecond, setPixelsPerSecond]);

    const zoomOut = useCallback(() => {
        setPixelsPerSecond(Math.max(pixelsPerSecond / 1.25, 10));
    }, [pixelsPerSecond, setPixelsPerSecond]);

    return { pixelsPerSecond, setPixelsPerSecond, zoomIn, zoomOut };
};
