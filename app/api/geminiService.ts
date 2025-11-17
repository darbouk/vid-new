import { GoogleGenAI } from "@google/genai";
import type { AspectRatio, Resolution } from '../../lib/types';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // FIX: All declarations of 'aistudio' must have identical modifiers. Adding readonly.
    readonly aistudio: AIStudio;
  }
}

const loadingMessages = [
  "Warming up the AI generators...",
  "Conceptualizing your vision...",
  "Gathering pixels from the digital ether...",
  "Directing the first scene...",
  "Rendering the opening sequence...",
  "Applying cinematic lighting...",
  "Composing the digital score...",
  "This is taking a bit longer than expected, but great art takes time!",
  "Finalizing the special effects...",
  "Polishing the final cut...",
  "Almost there, your masterpiece is moments away!",
];

export const generateVideo = async (
  prompt: string,
  aspectRatio: AspectRatio,
  setLoadingMessage: (message: string) => void,
  onSuccess: (url: string, blob: Blob) => void,
  onError: (error: string) => void,
  onKeySelected: () => void,
  resolution: Resolution,
  signal: AbortSignal
) => {
  let interval: ReturnType<typeof setInterval> | undefined;
  try {
    if (signal.aborted) return;

    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await window.aistudio.openSelectKey();
      onKeySelected();
      // Assume key selection is successful and proceed
    }
    
    // Create a new instance right before the call to use the latest key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    setLoadingMessage(loadingMessages[0]);
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: resolution,
        aspectRatio: aspectRatio,
      }
    });

    let messageIndex = 1;
    interval = setInterval(() => {
      setLoadingMessage(loadingMessages[messageIndex % loadingMessages.length]);
      messageIndex++;
    }, 5000);

    while (!operation.done) {
      if (signal.aborted) {
        clearInterval(interval);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 10000));
      try {
        operation = await ai.operations.getVideosOperation({ operation: operation });
      } catch (e: any) {
         if (e.message?.includes("Requested entity was not found.")) {
            clearInterval(interval);
            onError("API Key error. Please re-select your API key and try again.");
            await window.aistudio.openSelectKey();
            onKeySelected();
            return;
        }
        throw e; // re-throw other errors
      }
    }

    clearInterval(interval);
    interval = undefined;

    if (signal.aborted) return;

    if (operation.response?.generatedVideos?.[0]?.video?.uri) {
        const downloadLink = operation.response.generatedVideos[0].video.uri;
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`, { signal });
        if (!response.ok) {
            throw new Error(`Failed to download video: ${response.statusText}`);
        }
        const blob = await response.blob();
        const videoUrl = URL.createObjectURL(blob);
        onSuccess(videoUrl, blob);
    } else {
      throw new Error("Video generation failed or returned no URI.");
    }
  } catch (e: any)
   {
    if (interval) clearInterval(interval);

    if (e.name === 'AbortError') {
      console.log('Video generation cancelled.');
      return; // Gracefully exit on user cancellation
    }

    if (e.message?.includes("Requested entity was not found.")) {
        onError("API Key error. Please re-select your API key and try again.");
        await window.aistudio.openSelectKey();
        onKeySelected();
        return;
    }

    console.error(e);
    onError(e.message || "An unexpected error occurred during video generation.");
  }
};
