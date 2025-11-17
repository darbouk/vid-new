import { useCallback } from 'react';
import { useEditor } from '../useEditor';
import { useSelection } from '../useSelection';
import { updateClip } from '../../app/actions/timelineActions';
import type { AudioClip, VideoClip } from '../../lib/timeline';

type VolumetricClip = AudioClip | VideoClip;

/**
 * Manages the volume property for the currently selected audio or video clip.
 */
export const useVolumeControl = () => {
    const { selectedClips } = useSelection();
    const { dispatch } = useEditor();
    
    const isApplicable = selectedClips.length === 1 && (selectedClips[0].type === 'audio' || selectedClips[0].type === 'video');
    const clip = isApplicable ? selectedClips[0] as VolumetricClip : null;

    const volume = clip?.volume;

    const setVolume = useCallback((newVolume: number) => {
        if (clip) {
            const clampedVolume = Math.max(0, Math.min(1, newVolume));
            updateClip(dispatch, clip.id, { volume: clampedVolume });
        }
    }, [clip, dispatch]);

    return {
        clip,
        volume,
        setVolume,
        isApplicable,
    };
};
