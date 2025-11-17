import React from 'react';
import { useEditor } from '../../hooks/useEditor';
import { PlayIcon, PauseIcon, BackwardIcon, ForwardIcon, SearchPlusIcon, SearchMinusIcon, UndoIcon, RedoIcon, VolumeIcon, VolumeXIcon } from '../icons/Icons';
import { usePlayback } from '../../hooks/usePlayback';
import { useTimelineZoom } from '../../hooks/useTimelineZoom';

interface TimelineHeaderProps {
    isRuler?: boolean;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({ isRuler = false }) => {
    const { state, undo, redo, canUndo, canRedo } = useEditor();
    const { duration } = state.timeline;
    const { isPlaying, currentTime, togglePlay, forward, rewind, seek, volume, isMuted, setVolume, setIsMuted } = usePlayback();
    const { pixelsPerSecond, setPixelsPerSecond } = useTimelineZoom();

    const timeMarkers = Array.from({ length: Math.floor(duration) + 1 }, (_, i) => i);

    if (isRuler) {
        return (
            <div className="h-10 border-b border-gray-700 relative">
                {timeMarkers.map(time => (
                    <div key={time} style={{ left: `${time * pixelsPerSecond}px`}} className="absolute h-full flex flex-col items-start">
                        <span className="text-xs text-gray-500 -translate-x-1/2">{time}s</span>
                        <div className="w-px h-2 bg-gray-500 mt-1"></div>
                    </div>
                ))}
            </div>
        );
    }
    
    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const bar = e.currentTarget;
        const rect = bar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const seekTime = (clickX / width) * duration;
        seek(seekTime);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (newVolume > 0 && isMuted) {
            setIsMuted(false);
        }
    }

    const VolumeControlIcon = isMuted || volume === 0 ? VolumeXIcon : VolumeIcon;

  return (
    <div className="flex flex-col gap-2 mb-2">
        {/* Progress Bar Row */}
        <div className="flex items-center gap-3 w-full">
            <span className="text-sm text-gray-400 font-mono w-12 text-center">{currentTime.toFixed(2)}</span>
            <div 
                onClick={handleSeek} 
                className="w-full h-1.5 bg-gray-600 rounded cursor-pointer group relative flex-grow"
            >
                <div className="absolute h-full bg-indigo-400 rounded" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
                <div 
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" 
                style={{ left: `${(currentTime / duration) * 100}%` }}
                ></div>
            </div>
            <span className="text-sm text-gray-400 font-mono w-12 text-center">{duration.toFixed(2)}</span>
        </div>
        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <div className="flex items-center gap-2">
                <button 
                    onClick={undo}
                    disabled={!canUndo}
                    className="p-2 text-gray-300 hover:text-white rounded-md hover:bg-gray-700 disabled:text-gray-600 disabled:bg-transparent disabled:cursor-not-allowed" 
                    aria-label="Undo"
                >
                    <UndoIcon />
                </button>
                <button 
                    onClick={redo}
                    disabled={!canRedo}
                    className="p-2 text-gray-300 hover:text-white rounded-md hover:bg-gray-700 disabled:text-gray-600 disabled:bg-transparent disabled:cursor-not-allowed" 
                    aria-label="Redo"
                >
                    <RedoIcon />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <button onClick={rewind} className="p-2 text-gray-300 hover:text-white rounded-md hover:bg-gray-700" aria-label="Rewind"><BackwardIcon /></button>
                <button 
                    onClick={togglePlay}
                    className="p-3 text-white bg-gray-700 hover:bg-gray-600 rounded-full"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>
                <button onClick={forward} className="p-2 text-gray-300 hover:text-white rounded-md hover:bg-gray-700" aria-label="Forward"><ForwardIcon /></button>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 group">
                    <button onClick={() => setIsMuted(!isMuted)} className="p-1">
                        <VolumeControlIcon className="w-6 h-6 text-gray-300 hover:text-white" />
                    </button>
                    <input 
                        type="range"
                        min="0" max="1" step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer transition-all duration-300 w-0 group-hover:w-24 opacity-0 group-hover:opacity-100"
                        aria-label="Volume"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <SearchMinusIcon className="text-gray-400"/>
                    <input 
                        type="range" 
                        min="10" 
                        max="200"
                        value={pixelsPerSecond}
                        onChange={(e) => setPixelsPerSecond(parseInt(e.target.value, 10))}
                        className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        aria-label="Zoom timeline"
                    />
                    <SearchPlusIcon className="text-gray-400"/>
                </div>
            </div>
        </div>
    </div>
    );
};
