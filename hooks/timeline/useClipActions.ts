import { useCallback } from 'react';
import { useEditor } from '../useEditor';
import { useSelection } from '../useSelection';
import { 
    splitSelectedClip, 
    duplicateSelectedClips, 
    deleteSelectedClips 
} from '../../app/actions/timelineActions';

/**
 * Provides a set of memoized functions for performing common actions
 * on the currently selected clips in the timeline.
 */
export const useClipActions = () => {
    const { state, dispatch } = useEditor();
    const { selectedClips } = useSelection();

    const split = useCallback(() => {
        splitSelectedClip(dispatch, state.selection, state.playback.currentTime);
    }, [dispatch, state.selection, state.playback.currentTime]);

    const duplicate = useCallback(() => {
        duplicateSelectedClips(dispatch, state.selection);
    }, [dispatch, state.selection]);

    const remove = useCallback(() => {
        deleteSelectedClips(dispatch, state.selection);
    }, [dispatch, state.selection]);

    return {
        split,
        duplicate,
        remove,
        canSplit: selectedClips.length === 1,
        canDuplicate: selectedClips.length > 0,
        canRemove: selectedClips.length > 0,
    };
};
