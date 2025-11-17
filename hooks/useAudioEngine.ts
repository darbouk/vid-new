import { useEffect, useRef } from 'react';
import { useEditor } from './useEditor';
import { AudioClip } from '../lib/timeline';

export const useAudioEngine = () => {
    const { state } = useEditor();
    const { timeline, playback, projectAssets } = state;
    const { isPlaying, currentTime, volume, isMuted } = playback;

    // FIX: Changed the ref type to the more specific HTMLVideoElement to resolve type inference issues.
    const mediaElementsRef = useRef<Record<string, HTMLVideoElement>>({});

    // Sync media elements with project assets
    useEffect(() => {
        const mediaElements = mediaElementsRef.current;
        
        projectAssets.forEach(asset => {
            if ((asset.type === 'audio' || asset.type === 'video') && !mediaElements[asset.id]) {
                const media = document.createElement('video'); // Use video element for both
                media.src = asset.url;
                media.preload = 'auto';
                media.style.display = 'none';
                document.body.appendChild(media);
                mediaElements[asset.id] = media;
            }
        });

        // Cleanup
        return () => {
            Object.values(mediaElementsRef.current).forEach(el => (el as HTMLElement).remove());
            mediaElementsRef.current = {};
        };
    }, [projectAssets]);

    // Playback logic
    useEffect(() => {
        const mediaElements = mediaElementsRef.current;

        const activeMediaClips = timeline.tracks
            .flatMap(track => track.clips.map(clipId => timeline.clips[clipId]))
            .filter(clip => clip && (clip.type === 'audio' || clip.type === 'video'))
            .filter(clip => currentTime >= clip.start && currentTime < clip.start + clip.duration);

        const activeAssetIds = new Set(activeMediaClips.map(c => c.assetId));

        // Pause any media that is no longer active
        // FIX: Explicitly type `media` as HTMLVideoElement to fix type inference issue.
        Object.entries(mediaElements).forEach(([assetId, media]) => {
            const videoElement = media as HTMLVideoElement;
            if (!activeAssetIds.has(assetId) && !videoElement.paused) {
                videoElement.pause();
            }
        });

        if (isPlaying) {
            activeMediaClips.forEach(clip => {
                const media = mediaElements[clip.assetId];
                if (media) {
                    const clipVolume = (clip as AudioClip).volume ?? 1.0;
                    media.volume = isMuted ? 0 : volume * clipVolume;
                    const mediaTime = currentTime - clip.start;

                    // To avoid jerky playback from minor seeks, only set currentTime if difference is significant
                    if (Math.abs(media.currentTime - mediaTime) > 0.2) {
                        media.currentTime = mediaTime;
                    }
                    if (media.paused) {
                        media.play().catch(e => console.error("Media play failed:", e));
                    }
                }
            });
        } else {
             // FIX: Explicitly type `media` as HTMLVideoElement to fix type inference issue.
             Object.values(mediaElements).forEach(media => {
                const videoElement = media as HTMLVideoElement;
                if (!videoElement.paused) {
                    videoElement.pause();
                }
            });
        }
    }, [isPlaying, currentTime, volume, isMuted, timeline, projectAssets]);
};