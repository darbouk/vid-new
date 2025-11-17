import { useState, useCallback, useEffect, useRef } from 'react';

export const useFileDrop = (onDrop: (files: FileList) => void) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const counter = useRef(0);

    const handleDragEnter = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        counter.current++;
        if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
            setIsDragOver(true);
        }
    }, []);
    
    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        counter.current--;
        if (counter.current === 0) {
            setIsDragOver(false);
        }
    }, []);

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        counter.current = 0;
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            onDrop(e.dataTransfer.files);
        }
    }, [onDrop]);

    useEffect(() => {
        const dropzone = window;
        dropzone.addEventListener('dragenter', handleDragEnter);
        dropzone.addEventListener('dragleave', handleDragLeave);
        dropzone.addEventListener('dragover', handleDragOver);
        dropzone.addEventListener('drop', handleDrop);
        
        return () => {
            dropzone.removeEventListener('dragenter', handleDragEnter);
            dropzone.removeEventListener('dragleave', handleDragLeave);
            dropzone.removeEventListener('dragover', handleDragOver);
            dropzone.removeEventListener('drop', handleDrop);
        };
    }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

    return { isDragOver };
};
