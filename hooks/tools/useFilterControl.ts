import { useCallback } from 'react';
import { useEditor } from '../useEditor';
import { useSelection } from '../useSelection';
import { updateClip } from '../../app/actions/timelineActions';
import type { VideoClip } from '../../lib/timeline';

export const availableFilters = ['none', 'grayscale', 'sepia', 'invert'];

/**
 * Manages the filter property for the currently selected video clip.
 */
export const useFilterControl = () => {
    const { selectedClips } = useSelection();
    const { dispatch } = useEditor();

    const isApplicable = selectedClips.length === 1 && selectedClips[0].type === 'video';
    const clip = isApplicable ? selectedClips[0] as VideoClip : null;

    const filter = clip?.filter;

    const setFilter = useCallback((newFilter: string | null) => {
        if (clip) {
            updateClip(dispatch, clip.id, { filter: newFilter === 'none' ? null : newFilter });
        }
    }, [clip, dispatch]);

    return {
        clip,
        filter,
        setFilter,
        isApplicable,
    };
};
