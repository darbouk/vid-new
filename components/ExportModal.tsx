import React, { useState, useEffect } from 'react';
import { XIcon, UploadIcon } from './icons/Icons';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExport: (filename: string, format: string) => void;
  videoUrl: string | null;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onConfirmExport, videoUrl }) => {
  const [filename, setFilename] = useState('ai-generated-video');
  const [format, setFormat] = useState('MP4');

  useEffect(() => {
    // Reset state when modal opens
    if (isOpen) {
      setFilename('ai-generated-video');
      setFormat('MP4');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExport = () => {
    if (filename.trim() && videoUrl) {
      onConfirmExport(filename.trim(), format);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleExport();
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
        aria-modal="true"
        role="dialog"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Export Video</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                <XIcon className="w-5 h-5 text-gray-500" />
            </button>
        </div>

        <div className="p-6 space-y-6">
            <div className="w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
                {videoUrl ? (
                    <video src={videoUrl} controls className="w-full h-full object-contain" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No video to preview
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="filename" className="block text-sm font-medium text-gray-700">Filename</label>
                <div className="flex">
                     <input
                        id="filename"
                        type="text"
                        value={filename}
                        onChange={(e) => setFilename(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-grow p-2 bg-gray-100 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-800"
                    />
                    <span className="inline-flex items-center px-3 text-gray-500 bg-gray-200 border border-l-0 border-gray-300 rounded-r-md">.{format.toLowerCase()}</span>
                </div>
               
            </div>

            <div className="space-y-2">
                 <label htmlFor="format" className="block text-sm font-medium text-gray-700">Format</label>
                 <select 
                    id="format" 
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-800 appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em'}}
                >
                    <option>MP4</option>
                    <option disabled>WEBM (coming soon)</option>
                    <option disabled>MOV (coming soon)</option>
                    <option disabled>AVI (coming soon)</option>
                 </select>
            </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
             <button
                onClick={handleExport}
                disabled={!filename.trim() || !videoUrl}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                <UploadIcon />
                <span>Download</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
