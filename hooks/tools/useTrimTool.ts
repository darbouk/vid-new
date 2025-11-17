import { useCallback } from 'react';
import { useEditor } from '../useEditor';
import { useSelection } from '../useSelection';
import { updateClip } from '../../app/actions/timelineActions';
import type { AnyClip } from '../../lib/timeline';

/**
 * Manages precise trimming of a clip's start and end points.
 */
export const useTrimTool = () => {
    const { selectedClips } = useSelection();
    const { dispatch } = useEditor();

    const isApplicable = selectedClips.length === 1;
    const clip = isApplicable ? selectedClips[0] as AnyClip : null;

    const setTrim = useCallback((newStart: number, newDuration: number) => {
        if (clip) {
            // Add validation logic here, e.g., ensure trim doesn't exceed asset duration
            updateClip(dispatch, clip.id, { start: newStart, duration: newDuration });
        }
    }, [clip, dispatch]);

    return {
        clip,
        setTrim,
        isApplicable,
    };
};
