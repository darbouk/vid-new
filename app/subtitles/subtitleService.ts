import { GoogleGenAI } from '@google/genai';
import { SubtitleCue } from '../../lib/subtitles/types';
import { Asset } from '../../lib/assets';

// Placeholder for parsing a .srt or .vtt file content
export const parseSubtitleFile = (fileContent: string): SubtitleCue[] => {
    // This is a very basic parser for demonstration.
    // A real implementation would need to be much more robust.
    const lines = fileContent.split(/\r?\n/);
    const cues: SubtitleCue[] = [];
    let i = 0;
    while (i < lines.length) {
        if (lines[i].match(/^\d+$/)) {
            const id = lines[i];
            const timeLine = lines[i + 1];
            if (timeLine && timeLine.includes('-->')) {
                const [start, end] = timeLine.split(' --> ');
                const textLines: string[] = [];
                let j = i + 2;
                while (lines[j] && lines[j].trim() !== '') {
                    textLines.push(lines[j]);
                    j++;
                }
                cues.push({
                    id,
                    startTime: parseTimeToSeconds(start),
                    endTime: parseTimeToSeconds(end),
                    text: textLines.join('\n'),
                });
                i = j;
            }
        }
        i++;
    }
    return cues;
};

const parseTimeToSeconds = (time: string): number => {
    const parts = time.split(':');
    const secondsParts = parts[2].split(',');
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(secondsParts[0]) + parseInt(secondsParts[1]) / 1000;
}

export const generateSubtitlesFromAudio = async (asset: Asset): Promise<string> => {
    if (!('url' in asset)) throw new Error("Asset has no URL to transcribe.");
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const fileToGenerativePart = async (url: string) => {
            const response = await fetch(url);
            const blob = await response.blob();
            
            const base64EncodedData = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
                reader.readAsDataURL(blob);
            });
            return {
                inlineData: { data: base64EncodedData, mimeType: blob.type },
            };
        };

        const audioPart = await fileToGenerativePart(asset.url);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [ {text: "Transcribe this audio file accurately. Provide only the transcribed text."}, audioPart ]},
        });
        
        const text = response.text;
        if (!text) {
             throw new Error("Transcription failed to produce text.");
        }
        return text;
    } catch (error) {
        console.error("Subtitle generation failed:", error);
        throw new Error("Failed to generate subtitles from audio.");
    }
};
