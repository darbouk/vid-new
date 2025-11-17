import { Dispatch } from 'react';
import { Action } from '../store/EditorProvider';
import { Asset, AudioAsset, VideoAsset, ImageAsset } from '../../lib/assets';
import { generateId, getMediaDuration } from '../../lib/utils';
import { getAudioWaveform } from '../audio/audioService';

// Helper to get image dimensions
const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = (e) => reject(new Error(`Failed to get dimensions for image ${url}: ${e}`));
        img.src = url;
    });
};

export const addAssetFromFile = async (dispatch: Dispatch<Action>, file: File) => {
    const type = file.type;
    const url = URL.createObjectURL(file);
    let newAsset: Asset | null = null;

    try {
        if (type.startsWith('video/')) {
            const { duration, width, height } = await getMediaDuration(url, 'video');
            newAsset = {
                id: generateId(),
                type: 'video',
                name: file.name,
                url,
                duration,
                width,
                height,
                createdAt: Date.now(),
            } as VideoAsset;
        } else if (type.startsWith('audio/')) {
            const { duration } = await getMediaDuration(url, 'audio');
            const waveform = await getAudioWaveform(url); // Generate waveform on upload
            newAsset = {
                id: generateId(),
                type: 'audio',
                name: file.name,
                url,
                duration,
                waveform, // Store it with the asset
                createdAt: Date.now(),
            } as AudioAsset;
        } else if (
            type.startsWith('image/') || 
            type === 'image/vnd.adobe.photoshop' || 
            file.name.toLowerCase().endsWith('.psb')
        ) {
            const { width, height } = await getImageDimensions(url);
            newAsset = {
                id: generateId(),
                type: 'image',
                name: file.name,
                url,
                width,
                height,
                createdAt: Date.now(),
            } as ImageAsset;
        } else {
            console.warn(`Unsupported file type: ${type} for file ${file.name}`);
            URL.revokeObjectURL(url); // Clean up
            return;
        }

        if (newAsset) {
            dispatch({ type: 'ADD_ASSET', payload: newAsset });
        }
    } catch (error) {
        console.error(`Failed to process file ${file.name}:`, error);
        URL.revokeObjectURL(url); // Clean up on error
    }
};
