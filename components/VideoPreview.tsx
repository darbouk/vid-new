import React, { useState, useRef, useEffect } from 'react';
import type { AspectRatio, Resolution } from '../lib/types';
import { SettingsIcon, MonitorIcon, ChevronDownIcon, FilmIcon, UploadIcon } from './icons/Icons';
import { useEditor } from '../hooks/useEditor';
import { useVideoRenderer } from '../hooks/useVideoRenderer';

interface VideoPreviewProps {
  videoUrl: string | null;
  isGenerating: boolean;
  loadingMessage: string;
  error: string | null;
  aspectRatio: AspectRatio;
  setAspectRatio: (aspectRatio: AspectRatio) => void;
  resolution: Resolution;
  setResolution: (resolution: Resolution) => void;
  onExport: () => void;
}

const aspectRatios: Record<AspectRatio, string> = {
  '16:9': 'aspect-video',
  '9:16': 'aspect-[9/16]',
};

const aspectRatiosMap: Record<AspectRatio, string> = {
  '16:9': 'Landscape',
  '9:16': 'Portrait',
};

const resolutions: Resolution[] = ['720p', '1080p'];

const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400"></div>
);

const Dropdown: React.FC<{
    buttonContent: React.ReactNode;
    items: { key: string, label: string }[];
    onSelect: (key: string) => void;
    disabled?: boolean;
}> = ({ buttonContent, items, onSelect, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    return (
        <div className="relative w-full sm:w-auto" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {buttonContent}
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {isOpen && (
            <div className="absolute bottom-full mb-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-20 overflow-hidden">
              {items.map(item => (
                <button
                  key={item.key}
                  onClick={() => { onSelect(item.key); setIsOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
    );
}

const TimelineRenderer: React.FC<{ aspectRatio: AspectRatio }> = ({ aspectRatio }) => {
    const { state } = useEditor();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useVideoRenderer(canvasRef, state, aspectRatio);

    return (
        <div className={`relative w-full max-w-5xl bg-black rounded-lg shadow-2xl transition-all duration-300 ${aspectRatios[aspectRatio]}`}>
            <canvas ref={canvasRef} className="w-full h-full object-contain rounded-lg" />
        </div>
    );
};


const VideoPreview: React.FC<VideoPreviewProps> = ({ videoUrl, isGenerating, loadingMessage, error, aspectRatio, setAspectRatio, resolution, setResolution, onExport }) => {
  const { state } = useEditor();
  const hasTimelineContent = state.timeline.tracks.some(t => t.clips.length > 0);

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden">
      {hasTimelineContent ? (
        <TimelineRenderer aspectRatio={aspectRatio} />
      ) : (
        <div className={`relative w-full max-w-5xl bg-black rounded-lg shadow-2xl transition-all duration-300 ${aspectRatios[aspectRatio]}`}>
          {isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black bg-opacity-80 z-10">
              <Spinner />
              <p className="text-lg text-gray-300 animate-pulse">{loadingMessage}</p>
            </div>
          )}
          {error && !isGenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black bg-opacity-80 z-10 p-4">
              <p className="text-lg text-red-400">Error</p>
              <p className="text-sm text-red-300 text-center max-w-md">{error}</p>
            </div>
          )}
          {videoUrl && !isGenerating && (
            <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain rounded-lg" />
          )}
          {!videoUrl && !isGenerating && !error && (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-600">Your generated video will appear here</p>
            </div>
          )}
        </div>
      )}
      <div className="w-full max-w-lg mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 mt-6">
        <Dropdown 
            buttonContent={<><MonitorIcon className="w-4 h-4" /><span>{aspectRatiosMap[aspectRatio]} ({aspectRatio})</span></>}
            items={(Object.keys(aspectRatiosMap) as AspectRatio[]).map(r => ({key: r, label: `${aspectRatiosMap[r]} (${r})`}))}
            onSelect={(r) => setAspectRatio(r as AspectRatio)}
            disabled={isGenerating}
        />
        <Dropdown 
            buttonContent={<><FilmIcon className="w-4 h-4" /><span>{resolution}</span></>}
            items={resolutions.map(r => ({key: r, label: r}))}
            onSelect={(r) => setResolution(r as Resolution)}
            disabled={isGenerating}
        />
        <button
          onClick={onExport}
          disabled={isGenerating || !hasTimelineContent}
          className="flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UploadIcon className="w-4 h-4" />
          <span>Export</span>
        </button>
        <button disabled={isGenerating} className="flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
          <div className="w-5 h-5 bg-gray-200 rounded-full border-2 border-gray-400"></div>
          <span>Background</span>
        </button>
      </div>
    </div>
  );
};

export default VideoPreview;
