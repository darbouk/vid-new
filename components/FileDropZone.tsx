import React from 'react';
import { UploadIcon } from './icons/Icons';

interface FileDropZoneProps {
  isDragOver: boolean;
  children: React.ReactNode;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ isDragOver, children }) => {
    return (
        <div className="relative h-full w-full">
            {children}
            {isDragOver && (
                <div className="absolute inset-0 bg-indigo-500 bg-opacity-20 border-4 border-dashed border-indigo-400 rounded-2xl flex items-center justify-center pointer-events-none z-50 backdrop-blur-sm">
                    <div className="text-center text-white bg-indigo-600/80 px-8 py-6 rounded-lg shadow-2xl">
                        <UploadIcon className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-2xl font-bold">
                            Drop files to upload
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
