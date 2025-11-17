import { useCallback } from 'react';
import { useEditor } from '../useEditor';
import { useSelection } from '../useSelection';
import { updateClip } from '../../app/actions/timelineActions';
import type { VideoClip, ElementClip } from '../../lib/timeline';

type TransformableClip = VideoClip | ElementClip;

/**
 * Manages transform properties (scale, rotation, position) for the selected clip.
 */
export const useTransformTool = () => {
    const { selectedClips } = useSelection();
    const { dispatch } = useEditor();

    const isApplicable = selectedClips.length === 1 && (selectedClips[0].type === 'video' || selectedClips[0].type === 'element');
    const clip = isApplicable ? selectedClips[0] as TransformableClip : null;

    const transform = clip?.transform;

    const setTransform = useCallback((newTransform: TransformableClip['transform']) => {
        if (clip) {
            updateClip(dispatch, clip.id, { transform: newTransform });
        }
    }, [clip, dispatch]);

    return {
        clip,
        transform,
        setTransform,
        isApplicable,
    };
};
