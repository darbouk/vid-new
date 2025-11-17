import { useState, useCallback, useEffect } from 'react';

/**
 * Manages the state and interactions for selecting a Google AI Studio API key.
 * It abstracts the `window.aistudio` API calls and provides a reactive
 * state for key selection status.
 */
export const useAPIKeyManager = () => {
    const [isKeySelected, setIsKeySelected] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    const checkKey = useCallback(async () => {
        setIsChecking(true);
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setIsKeySelected(hasKey);
        } catch (e) {
            console.error("Error checking for API key:", e);
            setIsKeySelected(false);
        } finally {
            setIsChecking(false);
        }
    }, []);

    useEffect(() => {
        checkKey();
    }, [checkKey]);
    
    const selectKey = useCallback(async () => {
        try {
            await window.aistudio.openSelectKey();
            // Assume success and update state optimistically after the dialog is closed.
            setIsKeySelected(true);
        } catch(e) {
            console.error("Error opening API key selection:", e);
        }
    }, []);

    return { isKeySelected, isChecking, checkKey, selectKey };
};
