import { useCallback } from 'react';
import { useEditor } from './useEditor';

export const useSelection = () => {
    const { state, dispatch } = useEditor();
    const { clips: selectedClipIds } = state.selection;

    const selectedClips = selectedClipIds.map(id => state.timeline.clips[id]).filter(Boolean);

    const setSelection = useCallback((clipId: string, multi: boolean = false) => {
        if (multi) {
            const newSelection = selectedClipIds.includes(clipId)
                ? selectedClipIds.filter(id => id !== clipId)
                : [...selectedClipIds, clipId];
            dispatch({ type: 'SET_SELECTION', payload: newSelection });
        } else {
            dispatch({ type: 'SET_SELECTION', payload: [clipId] });
        }
    }, [selectedClipIds, dispatch]);

    const clearSelection = useCallback(() => {
        dispatch({ type: 'SET_SELECTION', payload: [] });
    }, [dispatch]);

    return {
        selectedClipIds,
        selectedClips,
        hasSelection: selectedClipIds.length > 0,
        setSelection,
        clearSelection,
    };
};