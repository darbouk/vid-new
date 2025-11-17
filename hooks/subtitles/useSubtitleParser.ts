import { useState, useCallback } from 'react';
import { SubtitleCue } from '../../lib/subtitles';
import { parseSubtitleFile } from '../../app/subtitles';

export const useSubtitleParser = () => {
    const [cues, setCues] = useState<SubtitleCue[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const parseFile = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);
        try {
            const content = await file.text();
            if (!content) {
                throw new Error("File is empty.");
            }
            const parsedCues = parseSubtitleFile(content);
            setCues(parsedCues);
        } catch (e: any) {
            setError(e.message || 'Failed to parse subtitle file.');
            setCues([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { cues, setCues, error, isLoading, parseFile };
};
