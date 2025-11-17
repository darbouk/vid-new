import { TextStyle } from '../text';
import { ElementAsset } from '../elements';

export type ClipType = 'video' | 'audio' | 'text' | 'element';

export interface TimelineTrack {
  id: string;
  type: ClipType;
  clips: string[]; // array of clip IDs
}

interface BaseClip {
    id: string;
    assetId: string; // Corresponds to an Asset in the project
    type: ClipType;
    start: number; // in seconds
    duration: number; // in seconds
    trackId: string;
}

export interface VideoClip extends BaseClip {
    type: 'video';
    volume: number; // 0-1
    speed: number; // multiplier, e.g., 1
    transform: {
        scale: number;
        rotation: number; // degrees
        position: { x: number; y: number }; // percentages from center
    };
    crop: {
        top: number; // percentage
        bottom: number;
        left: number;
        right: number;
    };
    filter: string | null; // e.g., 'grayscale-100'
}

export interface AudioClip extends BaseClip {
    type: 'audio';
    waveform?: number[];
    volume: number; // 0-1
}

export interface TextClip extends BaseClip {
    type: 'text';
    text: string;
    style: TextStyle;
}

export interface ElementClip extends BaseClip {
    type: 'element';
    transform: {
        scale: number;
        rotation: number; // degrees
        position: { x: number; y: number }; // percentages from center
    };
    // Element-specific properties like position and size
    x: number;
    y: number;
    width: number;
    height: number;
}

export type AnyClip = VideoClip | AudioClip | TextClip | ElementClip;

export interface TimelineState {
    tracks: TimelineTrack[];
    clips: Record<string, AnyClip>;
    duration: number;
    pixelsPerSecond: number;
}