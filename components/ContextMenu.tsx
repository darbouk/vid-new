import React from 'react';

interface ContextMenuProps {
    isOpen: boolean;
    position: { x: number; y: number };
    onClose: () => void;
    children: React.ReactNode;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ isOpen, position, onClose, children }) => {
    if (!isOpen) {
        return null;
    }

    // Adjust position to keep menu within viewport
    const x = Math.min(position.x, window.innerWidth - 200); // assume 200px width
    const y = Math.min(position.y, window.innerHeight - 150); // assume 150px height

    return (
        <div
            role="dialog"
            className="fixed z-50 bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[150px]"
            style={{ top: y, left: x }}
        >
            <ul onClick={onClose}>
                {children}
            </ul>
        </div>
    );
};

export const ContextMenuItem: React.FC<{ onClick: () => void, children: React.ReactNode, danger?: boolean }> = ({ onClick, children, danger }) => {
    return (
        <li>
            <button
                onClick={onClick}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-100'}`}
            >
                {children}
            </button>
        </li>
    )
};
