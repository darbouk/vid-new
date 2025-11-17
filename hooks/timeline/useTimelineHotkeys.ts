import { useMemo } from 'react';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import { usePlayback } from '../usePlayback';
import { useClipActions } from './useClipActions';

/**
 * Centralizes all keyboard shortcuts related to the timeline and playback.
 */
export const useTimelineHotkeys = () => {
    const { togglePlay } = usePlayback();
    const { split, remove } = useClipActions();

    const shortcuts = useMemo(() => ({
        ' ': (e: KeyboardEvent) => {
            e.preventDefault();
            togglePlay();
        },
        's': (e: KeyboardEvent) => {
            e.preventDefault();
            split();
        },
        'Backspace': (e: KeyboardEvent) => {
            e.preventDefault();
            remove();
        },
        'Delete': (e: KeyboardEvent) => {
            e.preventDefault();
            remove();
        },
    }), [togglePlay, split, remove]);

    useKeyboardShortcuts(shortcuts);
};
