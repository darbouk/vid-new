import { useEffect, useCallback } from 'react';

type ShortcutCallback = (e: KeyboardEvent) => void;
type ShortcutMap = Record<string, ShortcutCallback>;

export const useKeyboardShortcuts = (shortcutMap: ShortcutMap) => {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const key = event.key;
        
        const handler = shortcutMap[key] || shortcutMap[event.code];

        if (handler) {
            // Check if user is typing in an input field.
            const target = event.target as HTMLElement;
            const isInputFocused = 
                target.tagName === 'INPUT' || 
                target.tagName === 'TEXTAREA' || 
                target.tagName === 'SELECT' ||
                target.isContentEditable;

            // Allow shortcuts with modifier keys (like Cmd+Z) even in inputs.
            if (isInputFocused && !event.metaKey && !event.ctrlKey && !event.altKey) {
                return;
            }

            handler(event);
        }
    }, [shortcutMap]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);
};
