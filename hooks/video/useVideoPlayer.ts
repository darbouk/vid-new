import React, { useState, useRef, useCallback, useEffect } from 'react';

export const useVideoPlayer = (videoElementRef: React.RefObject<HTMLVideoElement>) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    
    const togglePlay = useCallback(() => {
        const video = videoElementRef.current;
        if (video) {
            if (video.paused) {
                video.play().catch(console.error);
            } else {
                video.pause();
            }
        }
    }, [videoElementRef]);
    
    useEffect(() => {
        const video = videoElementRef.current;
        if (!video) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleTimeUpdate = () => {
            if (video.duration) {
                setProgress((video.currentTime / video.duration) * 100);
            }
        };

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [videoElementRef]);
    
    return { isPlaying, progress, togglePlay };
};
