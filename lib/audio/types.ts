import type { AudioClip } from '../timeline/types';

export interface AudioEffect {
    type: 'reverb' | 'eq' | 'compression' | 'fade-in' | 'fade-out';
    settings: Record<string, any>;
}

export interface MusicTrack extends AudioClip {
    genre: string;
    mood: string;
}

export interface VoiceoverTrack extends AudioClip {
    speaker: string;
    transcript?: string;
}
