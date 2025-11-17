import type { Resolution } from '../types';

export interface AppSettings {
    projectName: string;
    defaultResolution: Resolution;
    autosave: boolean;
    // Add other settings as needed
}