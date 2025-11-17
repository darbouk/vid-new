import { useCallback, useEffect, useRef } from 'react';
import { useEditor } from './useEditor';

export const usePlayback = () => {
    const { state, dispatch } = useEditor();
    const { isPlaying, currentTime, volume, isMuted } = state.playback;
    const { duration } = state.timeline;

    const animationFrameRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number | null>(null);
    const stateRef = useRef(state);
    stateRef.current = state;


    const animate = useCallback((time: number) => {
        const lastTime = lastTimeRef.current;
        const deltaTime = lastTime === null ? 0 : (time - lastTime) / 1000;
        lastTimeRef.current = time;

        const currentState = stateRef.current;
        let newTime = currentState.playback.currentTime + deltaTime;

        if (newTime >= currentState.timeline.duration) {
            newTime = currentState.timeline.duration;
            dispatch({ type: 'SET_IS_PLAYING', payload: false, meta: { skipHistory: true } });
        }
        dispatch({ type: 'SET_CURRENT_TIME', payload: newTime, meta: { skipHistory: true } });

        if (newTime < currentState.timeline.duration && currentState.playback.isPlaying) {
            animationFrameRef.current = requestAnimationFrame(animate);
        }
    }, [dispatch]);

    useEffect(() => {
        if (isPlaying) {
            lastTimeRef.current = null;
            animationFrameRef.current = requestAnimationFrame(animate);
        } else {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }
        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isPlaying, animate]);

    const togglePlay = useCallback(() => {
        if (currentTime >= duration && !isPlaying) {
             dispatch({ type: 'SET_CURRENT_TIME', payload: 0, meta: { skipHistory: true } });
        }
        dispatch({ type: 'SET_IS_PLAYING', payload: !isPlaying, meta: { skipHistory: true } });
    }, [isPlaying, dispatch, currentTime, duration]);

    const seek = useCallback((time: number) => {
        const newTime = Math.max(0, Math.min(time, duration));
        dispatch({ type: 'SET_CURRENT_TIME', payload: newTime, meta: { skipHistory: true } });
    }, [duration, dispatch]);

    const setVolume = useCallback((newVolume: number) => {
        dispatch({ type: 'SET_VOLUME', payload: newVolume, meta: { skipHistory: true }});
    }, [dispatch]);

    const setIsMuted = useCallback((muted: boolean) => {
        dispatch({ type: 'SET_IS_MUTED', payload: muted, meta: { skipHistory: true }});
    }, [dispatch]);

    const forward = useCallback(() => {
        seek(currentTime + 5);
    }, [currentTime, seek]);

    const rewind = useCallback(() => {
        seek(currentTime - 5);
    }, [currentTime, seek]);

    return {
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        togglePlay,
        seek,
        setVolume,
        setIsMuted,
        forward,
        rewind,
    };
};
