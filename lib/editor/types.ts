import { TimelineState, AnyClip } from '../timeline';
import { Asset } from '../assets';

export interface PlaybackState {
    isPlaying: boolean;
    currentTime: number;
    volume: number; // 0-1
    isMuted: boolean;
}

export interface SelectionState {
    clips: string[]; // array of selected clip IDs
}

export interface EditorState {
    projectAssets: Asset[];
    timeline: TimelineState;
    playback: PlaybackState;
    selection: SelectionState;
    isRecording: boolean;
    // Add other global editor states here
}

export const DND_TYPES = {
    ASSET: 'application/x.video-editor.asset',
    CLIP: 'application/x.video-editor.clip',
} as const;
