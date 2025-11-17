import React, { useState, useCallback, useEffect } from 'react';

export const useContextMenu = () => {
    const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
    const [isOpen, setIsOpen] = useState(false);
    const [contextData, setContextData] = useState<any>(null);

    const handleContextMenu = useCallback((event: React.MouseEvent, data?: any) => {
        event.preventDefault();
        event.stopPropagation();
        setAnchorPoint({ x: event.pageX, y: event.pageY });
        setIsOpen(true);
        if (data) {
            setContextData(data);
        }
    }, []);

    const closeContextMenu = useCallback(() => {
        setIsOpen(false);
        setContextData(null);
    }, []);

    useEffect(() => {
        const handleClick = () => {
            if (isOpen) {
                closeContextMenu();
            }
        };

        // Close on any click or subsequent right-click
        document.addEventListener('click', handleClick);
        document.addEventListener('contextmenu', handleClick, true);

        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('contextmenu', handleClick, true);
        };
    }, [isOpen, closeContextMenu]);

    return { anchorPoint, isOpen, contextData, handleContextMenu, closeContextMenu };
};
