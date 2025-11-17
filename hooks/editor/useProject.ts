import { useCallback } from 'react';
import { useEditor } from '../useEditor';
import { EditorState } from '../../lib/editor';

const LOCAL_STORAGE_KEY = 'ai-video-editor-project';

/**
 * Manages saving and loading the project state to/from local storage.
 */
export const useProject = () => {
    const { state, dispatch } = useEditor();

    const saveProject = useCallback(() => {
        try {
            const stateToSave = JSON.stringify(state);
            localStorage.setItem(LOCAL_STORAGE_KEY, stateToSave);
            console.log('Project saved!');
        } catch (error) {
            console.error('Failed to save project:', error);
        }
    }, [state]);

    const loadProject = useCallback(() => {
        try {
            const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedStateJSON) {
                const savedState: EditorState = JSON.parse(savedStateJSON);
                // Here you would dispatch an action to replace the current state
                // For now, we'll just log it.
                console.log('Project loaded:', savedState);
                // Example: dispatch({ type: 'LOAD_PROJECT_STATE', payload: savedState });
            }
        } catch (error) {
            console.error('Failed to load project:', error);
        }
    }, [dispatch]);

    return { saveProject, loadProject };
};
