import { useCallback } from 'react';
import { useEditor } from '../useEditor';
import { useSelection } from '../useSelection';
import { updateClip } from '../../app/actions/timelineActions';
import type { VideoClip } from '../../lib/timeline';

/**
 * Manages the crop properties for the currently selected video clip.
 */
export const useCropTool = () => {
    const { selectedClips } = useSelection();
    const { dispatch } = useEditor();

    const isApplicable = selectedClips.length === 1 && selectedClips[0].type === 'video';
    const clip = isApplicable ? selectedClips[0] as VideoClip : null;

    const crop = clip?.crop;

    const setCrop = useCallback((newCrop: VideoClip['crop']) => {
        if (clip) {
            updateClip(dispatch, clip.id, { crop: newCrop });
        }
    }, [clip, dispatch]);

    return {
        clip,
        crop,
        setCrop,
        isApplicable,
    };
};
