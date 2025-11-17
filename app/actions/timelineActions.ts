import React, { Dispatch } from 'react';
import { Action } from '../store/EditorProvider';
import { EditorState, SelectionState } from '../../lib/editor';
import { generateId, getMediaDuration } from '../../lib/utils';
import { AnyClip, TimelineTrack, TextClip, ElementClip, AudioClip, VideoClip } from '../../lib/timeline';
import type { TextStyle } from '../../lib/text';
import { Asset, AudioAsset, VideoAsset } from '../../lib/assets';
import { DND_TYPES } from '../../lib/editor';

export const addAudioClipAndAsset = async (dispatch: Dispatch<Action>, file: File, startTime: number) => {
    // This action can now be simplified if assets are added via `addAssetFromFile`
    // which already generates waveforms. Keeping it for direct recording workflow.
    const url = URL.createObjectURL(file);
    const { duration } = await getMediaDuration(url, 'audio');
    const newAsset: Asset = {
        id: generateId(),
        type: 'audio',
        name: file.name,
        url,
        duration,
        createdAt: Date.now(),
    };
    dispatch({ type: 'ADD_ASSET', payload: newAsset });
    
    const newClip: Omit<AudioClip, 'id' | 'trackId'> = {
        assetId: newAsset.id,
        type: 'audio',
        start: startTime,
        duration,
        volume: 1,
    };
    addClip(dispatch, newClip);
};

export const addTextClip = (dispatch: Dispatch<Action>, text: string, style: TextStyle, startTime: number) => {
    const newAsset: Asset = {
        id: generateId(),
        type: 'text',
        name: 'Text',
        text,
        createdAt: Date.now(),
    };
    dispatch({ type: 'ADD_ASSET', payload: newAsset });

    const newClip: Omit<TextClip, 'id' | 'trackId'> = {
        assetId: newAsset.id,
        type: 'text',
        text,
        style,
        start: startTime,
        duration: 5,
    };
    // Add to the first video track for now, assuming text is an overlay
    const videoTrack = (dispatch as any).getState?.().timeline.tracks.find((t: TimelineTrack) => t.type === 'video');
    addClip(dispatch, newClip, videoTrack);
}

export const addElementClip = (dispatch: Dispatch<Action>, assetId: string, startTime: number) => {
    const newClip: Omit<ElementClip, 'id' | 'trackId'> = {
        assetId,
        type: 'element',
        start: startTime,
        duration: 5,
        transform: { scale: 1, rotation: 0, position: { x: 0, y: 0 } },
        x: 50, y: 50, width: 100, height: 100,
    };
    // Add to the first video track for now, assuming elements are overlays
    const videoTrack = (dispatch as any).getState?.().timeline.tracks.find((t: TimelineTrack) => t.type === 'video');
    addClip(dispatch, newClip, videoTrack);
}

export const addClip = (dispatch: Dispatch<Action>, clipData: Omit<AnyClip, 'id' | 'trackId'>, track?: TimelineTrack) => {
    const newClip = {
        ...clipData,
        id: generateId(),
    };
    
    dispatch({ type: 'ADD_CLIP', payload: { newClip, track } });
};

export const updateClip = (dispatch: Dispatch<Action>, clipId: string, updates: Partial<AnyClip>, skipHistory: boolean = false) => {
    dispatch({ type: 'UPDATE_CLIP', payload: { clipId, updates }, meta: { skipHistory } });
};


export const deleteClip = (dispatch: Dispatch<Action>, clipId: string) => {
    dispatch({ type: 'DELETE_CLIP', payload: { clipId } });
};

export const splitSelectedClip = (dispatch: Dispatch<Action>, selection: SelectionState, currentTime: number) => {
    if (selection.clips.length !== 1) return;
    const clipId = selection.clips[0];
    dispatch({ type: 'SPLIT_CLIP', payload: { clipId, splitTime: currentTime } });
};

export const duplicateSelectedClips = (dispatch: Dispatch<Action>, selection: SelectionState) => {
    if (selection.clips.length === 0) return;
    dispatch({ type: 'DUPLICATE_CLIPS', payload: { clipIds: selection.clips } });
};

export const deleteSelectedClips = (dispatch: Dispatch<Action>, selection: SelectionState) => {
    selection.clips.forEach(clipId => {
        dispatch({ type: 'DELETE_CLIP', payload: { clipId } });
    });
};

export const selectAllClips = (dispatch: Dispatch<Action>) => {
    dispatch({ type: 'SELECT_ALL_CLIPS' });
};

export const clearSelection = (dispatch: Dispatch<Action>) => {
    dispatch({ type: 'CLEAR_SELECTION' });
};

export const handleDrop = (e: React.DragEvent, state: EditorState, dispatch: Dispatch<Action>, targetTrackId?: string) => {
    const assetDataString = e.dataTransfer.getData(DND_TYPES.ASSET);
    if (assetDataString) {
        const { assetId } = JSON.parse(assetDataString);
        const asset = state.projectAssets.find(a => a.id === assetId);
        if (!asset) return;

        const timelineRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const scrollContainer = (e.currentTarget as HTMLElement).closest('[class*="overflow-x-auto"]');
        const scrollLeft = scrollContainer ? scrollContainer.scrollLeft : 0;
        
        const dropX = e.clientX - timelineRect.left + scrollLeft;
        const startTime = Math.max(0, dropX / state.timeline.pixelsPerSecond);


        let newClipData: Omit<AnyClip, 'id' | 'trackId'> | null = null;
        
        const defaultVideoProps = {
            volume: 1,
            speed: 1,
            transform: { scale: 1, rotation: 0, position: { x: 0, y: 0 } },
            crop: { top: 0, right: 0, bottom: 0, left: 0 },
            filter: null,
        };

        switch (asset.type) {
            case 'audio':
                newClipData = { assetId: asset.id, type: 'audio', start: startTime, duration: (asset as AudioAsset).duration || 10, volume: 1 } as Omit<AudioClip, 'id'|'trackId'>;
                break;
            case 'video':
                 newClipData = { 
                    assetId: asset.id, 
                    type: 'video', 
                    start: startTime, 
                    duration: (asset as VideoAsset).duration || 10,
                    ...defaultVideoProps,
                } as Omit<VideoClip, 'id'|'trackId'>;
                break;
            case 'image':
                 newClipData = { 
                    assetId: asset.id, 
                    type: 'video', 
                    start: startTime, 
                    duration: 5,
                    ...defaultVideoProps,
                } as Omit<VideoClip, 'id'|'trackId'>; // Treat images as video clips
                break;
            case 'text':
                // This case might be handled differently, e.g., by creating a default text clip
                break;
        }

        if (newClipData) {
            let trackForClip = state.timeline.tracks.find(t => t.id === targetTrackId && t.type === newClipData!.type) 
                            || state.timeline.tracks.find(t => t.type === newClipData!.type);
            
            if (!trackForClip && newClipData.type === 'video') { // Allow dropping video/image clips onto audio tracks if there's no video track
                 trackForClip = state.timeline.tracks.find(t => t.id === targetTrackId);
            }
            
            if(trackForClip) {
                addClip(dispatch, newClipData, trackForClip);
            }
        }
    }
};
