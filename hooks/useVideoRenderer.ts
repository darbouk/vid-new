import React, { useEffect, useRef } from 'react';
import { EditorState } from '../lib/editor';
import { AnyClip, TimelineState, VideoClip, TextClip, ElementClip } from '../lib/timeline';
import { AspectRatio } from '../lib/types';

export const useVideoRenderer = (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    editorState: EditorState,
    aspectRatio: AspectRatio
) => {
    const mediaCache = useRef<Record<string, HTMLVideoElement | HTMLImageElement>>({});

    // Preload assets and keep cache in sync
    useEffect(() => {
        editorState.projectAssets.forEach(asset => {
            if ((asset.type === 'video' || asset.type === 'audio') && !mediaCache.current[asset.id] && 'url' in asset) {
                const video = document.createElement('video');
                video.src = asset.url;
                video.muted = true;
                video.preload = 'auto';
                video.style.display = 'none';
                document.body.appendChild(video);
                mediaCache.current[asset.id] = video;
            } else if (asset.type === 'image' && !mediaCache.current[asset.id] && 'url' in asset) {
                const img = new Image();
                img.src = asset.url;
                mediaCache.current[asset.id] = img;
            }
        });

        // Cleanup
        return () => {
            Object.values(mediaCache.current).forEach(el => (el as HTMLElement).remove());
            mediaCache.current = {};
        };
    }, [editorState.projectAssets]);

    // Main render loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const { timeline, playback } = editorState;
        const { currentTime } = playback;

        let renderRequestId: number;

        const render = async () => {
            const ar = aspectRatio === '16:9' ? 16/9 : 9/16;
            const parentWidth = canvas.parentElement?.clientWidth ?? 1280;
            const parentHeight = canvas.parentElement?.clientHeight ?? 720;
            
            let canvasWidth = parentWidth;
            let canvasHeight = parentWidth / ar;

            if (canvasHeight > parentHeight) {
                canvasHeight = parentHeight;
                canvasWidth = parentHeight * ar;
            }

            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvasWidth * dpr;
            canvas.height = canvasHeight * dpr;
            canvas.style.width = `${canvasWidth}px`;
            canvas.style.height = `${canvasHeight}px`;
            ctx.scale(dpr, dpr);

            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            const activeClips = timeline.tracks
                .flatMap(track => track.clips.map(clipId => timeline.clips[clipId]))
                .filter((clip): clip is AnyClip => 
                    clip && currentTime >= clip.start && currentTime < clip.start + clip.duration
                )
                .sort((a, b) => {
                    const typeOrder = { video: 0, element: 1, text: 2, audio: -1 };
                    return typeOrder[a.type] - typeOrder[b.type];
                });

            for (const clip of activeClips) {
                ctx.save();
                ctx.filter = 'none';
                if (clip.type === 'video' && clip.filter) {
                    ctx.filter = clip.filter;
                }

                switch(clip.type) {
                    case 'video':
                        const videoEl = mediaCache.current[clip.assetId] as HTMLVideoElement;
                        const asset = editorState.projectAssets.find(a => a.id === clip.assetId);

                        if ((videoEl && videoEl.readyState >= videoEl.HAVE_CURRENT_DATA) || (asset?.type === 'image')) {
                            const mediaElement = asset?.type === 'image' ? mediaCache.current[clip.assetId] as HTMLImageElement : videoEl;
                            const mediaWidth = asset?.type === 'image' ? (asset as any).width : videoEl.videoWidth;
                            const mediaHeight = asset?.type === 'image' ? (asset as any).height : videoEl.videoHeight;
                            
                            if (asset?.type === 'video') {
                                const clipTime = (currentTime - clip.start) * clip.speed;
                                if (Math.abs(videoEl.currentTime - clipTime) > 0.1) {
                                    videoEl.currentTime = clipTime;
                                    await new Promise(r => setTimeout(r, 10)); // Allow seek
                                }
                            }
                            
                            const { transform, crop } = clip;
                            const centerX = canvasWidth / 2;
                            const centerY = canvasHeight / 2;
                            
                            ctx.translate(centerX + (transform.position.x / 100 * canvasWidth), centerY + (transform.position.y / 100 * canvasHeight));
                            ctx.rotate(transform.rotation * Math.PI / 180);
                            ctx.scale(transform.scale, transform.scale);
                            
                            const sx = mediaWidth * (crop.left / 100);
                            const sy = mediaHeight * (crop.top / 100);
                            const sWidth = mediaWidth * (1 - (crop.left + crop.right) / 100);
                            const sHeight = mediaHeight * (1 - (crop.top + crop.bottom) / 100);
                            
                            const hRatio = canvasWidth / sWidth;
                            const vRatio = canvasHeight / sHeight;
                            const ratio = Math.max(hRatio, vRatio);

                            const dWidth = sWidth * ratio;
                            const dHeight = sHeight * ratio;
                            
                            ctx.drawImage(mediaElement, sx, sy, sWidth, sHeight, -dWidth / 2, -dHeight / 2, dWidth, dHeight);
                        }
                        break;
                    case 'text':
                        const { style, text } = clip;
                        ctx.font = `${style.fontSize}px "${style.fontFamily}"`;
                        ctx.fillStyle = style.color;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(text, canvasWidth / 2, canvasHeight / 2);
                        break;
                }
                ctx.restore();
            }
            renderRequestId = requestAnimationFrame(render);
        };

        renderRequestId = requestAnimationFrame(render);

        return () => {
            cancelAnimationFrame(renderRequestId);
        };

    }, [editorState, canvasRef, aspectRatio]);
};
