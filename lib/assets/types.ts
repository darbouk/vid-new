export type AssetType = 'video' | 'audio' | 'image' | 'text';

interface BaseAsset {
    id: string;
    type: AssetType;
    name: string;
    createdAt: number;
}

export interface AudioAsset extends BaseAsset {
    type: 'audio';
    url: string;
    duration: number;
    waveform?: number[];
}

export interface VideoAsset extends BaseAsset {
    type: 'video';
    url: string;
    duration: number;
    width: number;
    height: number;
}

export interface ImageAsset extends BaseAsset {
    type: 'image';
    url: string;
    width: number;
    height: number;
}

export interface TextAsset extends BaseAsset {
    type: 'text';
    text: string;
}

export type Asset = AudioAsset | VideoAsset | ImageAsset | TextAsset;
