import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface ItemGeometry {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface LassoRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface UseLassoSelectProps {
    containerRef: React.RefObject<HTMLElement>;
    allItems: Map<string, ItemGeometry>;
    onSelectionChange: (selectedIds: string[], event: MouseEvent) => void;
}

export const useLassoSelect = ({ containerRef, allItems, onSelectionChange }: UseLassoSelectProps) => {
    const [isLassoing, setIsLassoing] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    const [endPoint, setEndPoint] = useState<{ x: number; y: number } | null>(null);

    const checkIntersection = useCallback((lasso: LassoRect, item: ItemGeometry): boolean => {
        return (
            lasso.x < item.x + item.width &&
            lasso.x + lasso.width > item.x &&
            lasso.y < item.y + item.height &&
            lasso.y + lasso.height > item.y
        );
    }, []);
    
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleMouseDown = (e: MouseEvent) => {
            if (e.target === container) {
                e.preventDefault();
                setIsLassoing(true);
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                setStartPoint({ x, y });
                setEndPoint({ x, y });
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isLassoing || !startPoint) return;
            e.preventDefault();
            const rect = container.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;
            setEndPoint({ x: currentX, y: currentY });

            const newLassoRect = {
                x: Math.min(startPoint.x, currentX),
                y: Math.min(startPoint.y, currentY),
                width: Math.abs(currentX - startPoint.x),
                height: Math.abs(currentY - startPoint.y),
            };

            const selectedIds: string[] = [];
            allItems.forEach((geometry, id) => {
                if (checkIntersection(newLassoRect, geometry)) {
                    selectedIds.push(id);
                }
            });
            onSelectionChange(selectedIds, e);
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (isLassoing) {
                // If there was no significant drag (i.e., a click), clear the selection
                // unless the shift key is being held.
                if (
                    startPoint &&
                    endPoint &&
                    Math.abs(startPoint.x - endPoint.x) < 5 &&
                    Math.abs(startPoint.y - endPoint.y) < 5
                ) {
                    if (!e.shiftKey) {
                        onSelectionChange([], e);
                    }
                }
                setIsLassoing(false);
                setStartPoint(null);
                setEndPoint(null);
            }
        };

        container.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isLassoing, startPoint, containerRef, allItems, checkIntersection, onSelectionChange]);

    const lassoRect = useMemo<LassoRect | null>(() => {
        if (!isLassoing || !startPoint || !endPoint) return null;
        return {
            x: Math.min(startPoint.x, endPoint.x),
            y: Math.min(startPoint.y, endPoint.y),
            width: Math.abs(endPoint.x - startPoint.x),
            height: Math.abs(endPoint.y - startPoint.y),
        };
    }, [isLassoing, startPoint, endPoint]);

    return { lassoRect };
};
