import type { AppSettings } from '../../lib/settings/types';
import { DEFAULT_SETTINGS } from '../../data/settings/constants';

// Using local storage for simple persistence of settings.
export const loadSettings = (): AppSettings => {
    const storedSettings = localStorage.getItem('appSettings');
    if (storedSettings) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
    }
    return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings): void => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
};
