import { useState, useEffect } from 'react';
import { AppSettings } from '../../lib/settings';
import { loadSettings, saveSettings } from '../../app/settings';

export const useSettings = () => {
    const [settings, setSettings] = useState<AppSettings>(loadSettings);

    useEffect(() => {
        saveSettings(settings);
    }, [settings]);

    return { settings, setSettings };
};
