import { useState, useCallback } from 'react';

/**
 * Provides a simple and reusable way to manage the state of a modal.
 */
export const useModal = (initialState = false) => {
    const [isOpen, setIsOpen] = useState(initialState);

    const openModal = useCallback(() => setIsOpen(true), []);
    const closeModal = useCallback(() => setIsOpen(false), []);
    const toggleModal = useCallback(() => setIsOpen(prev => !prev), []);

    return {
        isOpen,
        openModal,
        closeModal,
        toggleModal,
    };
};
