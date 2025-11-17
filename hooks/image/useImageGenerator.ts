import { useState, useCallback } from 'react';
import { generateImageAndAddToAssets } from '../../app/image/imageService';
import { useEditor } from '../useEditor';

export const useImageGenerator = () => {
    // FIX: Get dispatch from editor context to use with generateImageAndAddToAssets
    const { dispatch } = useEditor();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generate = useCallback(async (prompt: string) => {
        if (!prompt.trim()) {
            setError("Prompt cannot be empty.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // FIX: 'generateImage' is not exported. Use 'generateImageAndAddToAssets' and pass dispatch.
            // The service function does not return a URL.
            await generateImageAndAddToAssets(prompt, dispatch);
        } catch (e: any) {
            setError(e.message || 'Failed to generate image');
        } finally {
            setIsLoading(false);
        }
    }, [dispatch]);
    
    // FIX: Return value updated as imageUrl is no longer managed by this hook.
    return { isLoading, error, generate };
};
