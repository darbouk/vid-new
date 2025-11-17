import { useCallback } from 'react';
import { useEditor } from '../useEditor';
import { useSelection } from '../useSelection';
import { updateClip } from '../../app/actions/timelineActions';
import type { VideoClip } from '../../lib/timeline';

/**
 * Manages the speed property for the currently selected video clip.
 */
export const useSpeedControl = () => {
    const { selectedClips } = useSelection();
    const { dispatch } = useEditor();

    const isApplicable = selectedClips.length === 1 && selectedClips[0].type === 'video';
    const clip = isApplicable ? selectedClips[0] as VideoClip : null;

    const speed = clip?.speed;

    const setSpeed = useCallback((newSpeed: number) => {
        if (clip) {
            // Set a reasonable speed range
            const clampedSpeed = Math.max(0.25, Math.min(4, newSpeed));
            updateClip(dispatch, clip.id, { speed: clampedSpeed });
        }
    }, [clip, dispatch]);

    return {
        clip,
        speed,
        setSpeed,
        isApplicable,
    };
};
