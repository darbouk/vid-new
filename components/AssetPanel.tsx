import React, { useRef, useState, useEffect, useMemo } from 'react';
import type { SidebarItemType } from '../lib/types';
import { GenerateIcon, UploadIcon, ChevronRightIcon, MoreHorizontalIcon, MicrophoneIcon, XIcon, TextIcon, PlusIcon, SquareIcon, CircleIcon, TriangleIcon, StarIcon, AudioIcon, VideoIcon, ImageIcon, SearchIcon } from './icons/Icons';
import { AIAgentPanel } from './ai-agent';
import { FONT_FAMILIES, PRESET_COLORS, TRANSPARENT_COLOR } from '../data/text';
import type { TextStyle } from '../lib/text';
import { useEditor } from '../hooks/useEditor';
import { addAudioClipAndAsset, addTextClip, addElementClip, addClip } from '../app/actions/timelineActions';
import { addAssetFromFile } from '../app/actions/assetActions';
import { SHAPE_ELEMENTS } from '../data/elements';
import { DND_TYPES } from '../lib/editor';
import { useBrandKit } from '../hooks/brand-kit/useBrandKit';
import { useSettings } from '../hooks/settings/useSettings';
import { SettingsForm } from './settings';
import { LogoUploader } from './brand-kit';
import { useAudioRecorder } from '../hooks';
import { LiveWaveform } from './audio';
import { Asset, VideoAsset, AudioAsset, ImageAsset as ImageAssetType } from '../lib/assets';
import { generateImageAndAddToAssets } from '../app/image/imageService';
import { generateSubtitlesFromAudio } from '../app/subtitles/subtitleService';
import { VideoClip } from '../lib/timeline';

interface AssetPanelProps {
  activeItem: SidebarItemType;
  prompt: string;
  setPrompt: (prompt: string) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  onCancel: () => void;
}

const Spinner: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => (
  <div className={`animate-spin rounded-full border-b-2 border-indigo-400 ${size === 'sm' ? 'h-6 w-6' : 'h-10 w-10'}`}></div>
);

const AssetHeader: React.FC<{ title: string }> = ({ title }) => (
    <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button className="flex items-center text-sm text-gray-500 hover:text-indigo-600">
            View all <ChevronRightIcon className="w-4 h-4 ml-1" />
        </button>
    </div>
);

const AssetItem: React.FC<{ asset: Asset }> = ({ asset }) => {
    const assetIcon = {
        'video': <VideoIcon className="w-8 h-8 text-gray-100" />,
        'audio': <AudioIcon className="w-8 h-8 text-gray-100" />,
        'image': <ImageIcon className="w-8 h-8 text-gray-100" />,
        'text': <TextIcon className="w-8 h-8 text-gray-100" />,
    }[asset.type];

    const formatDuration = (d: number) => {
        const minutes = Math.floor(d / 60);
        const seconds = Math.floor(d % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    return (
        <div
            draggable="true"
            onDragStart={(e) => {
                e.dataTransfer.setData(DND_TYPES.ASSET, JSON.stringify({ assetId: asset.id }));
                e.dataTransfer.effectAllowed = 'copy';
            }}
            className="relative rounded-lg overflow-hidden group bg-gray-800 cursor-grab active:cursor-grabbing"
        >
            {asset.type === 'video' || asset.type === 'image' ? (
                <>
                    {asset.type === 'video' && <video src={(asset as VideoAsset).url} muted className="w-full h-full object-cover aspect-video" />}
                    {asset.type === 'image' && <img src={(asset as ImageAssetType).url} alt={asset.name} className="w-full h-full object-cover aspect-video" />}
                </>
            ) : (
                <div className="w-full h-full flex items-center justify-center aspect-video bg-gray-700">
                    {assetIcon}
                </div>
            )}
             <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                <p className="text-xs font-semibold truncate">{asset.name}</p>
             </div>
             {asset.type !== 'image' && 'duration' in asset && asset.duration > 0 && (
                <div className="absolute top-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                    {formatDuration(asset.duration)}
                </div>
             )}
        </div>
    )
}

const AssetGrid: React.FC<{ assets: Asset[] }> = ({ assets }) => (
    <div className="grid grid-cols-2 gap-2">
        {assets.map(asset => <AssetItem key={asset.id} asset={asset} />)}
    </div>
);

const AssetToolbar: React.FC<{
    filterQuery: string;
    onFilterChange: (value: string) => void;
    sortOption: string;
    onSortChange: (value: string) => void;
    sortOptions: { value: string; label: string }[];
}> = ({ filterQuery, onFilterChange, sortOption, onSortChange, sortOptions }) => {
    return (
        <div className="flex gap-2 mb-4">
            <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={filterQuery}
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                />
            </div>
            <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value)}
                className="py-2 pl-3 pr-8 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none bg-no-repeat bg-right"
                style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em'}}
            >
                {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );
};


const VideoPanel: React.FC<{ onFilesSelected: (files: FileList) => void }> = ({ onFilesSelected }) => {
    const { state } = useEditor();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [filterQuery, setFilterQuery] = useState('');
    const [sortOption, setSortOption] = useState('date-desc');

    const videoAssets = useMemo(() => {
        const assets = state.projectAssets.filter(a => a.type === 'video');
        
        const filtered = assets.filter(asset => 
            asset.name.toLowerCase().includes(filterQuery.toLowerCase())
        );

        const sorted = [...filtered];

        switch (sortOption) {
            case 'name-asc': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'name-desc': sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
            case 'date-desc': sorted.sort((a, b) => b.createdAt - a.createdAt); break;
            case 'date-asc': sorted.sort((a, b) => a.createdAt - b.createdAt); break;
            case 'duration-desc': sorted.sort((a, b) => ((b as VideoAsset).duration || 0) - ((a as VideoAsset).duration || 0)); break;
            case 'duration-asc': sorted.sort((a, b) => ((a as VideoAsset).duration || 0) - ((b as VideoAsset).duration || 0)); break;
        }
        return sorted;
    }, [state.projectAssets, filterQuery, sortOption]);

    const hasAnyVideoAssets = state.projectAssets.some(a => a.type === 'video');

    const sortOptions = [
        { value: 'date-desc', label: 'Newest' },
        { value: 'date-asc', label: 'Oldest' },
        { value: 'name-asc', label: 'Name (A-Z)' },
        { value: 'name-desc', label: 'Name (Z-A)' },
        { value: 'duration-desc', label: 'Longest' },
        { value: 'duration-asc', label: 'Shortest' },
    ];

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Video</h2>
            <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
            >
                <UploadIcon />
                <span>Upload</span>
            </button>
            <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="video/*"
                onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
                className="hidden"
            />
            {hasAnyVideoAssets ? (
                 <div className="mt-6">
                    <AssetToolbar 
                        filterQuery={filterQuery}
                        onFilterChange={setFilterQuery}
                        sortOption={sortOption}
                        onSortChange={setSortOption}
                        sortOptions={sortOptions}
                    />
                    <AssetHeader title="My Videos" />
                    {videoAssets.length > 0 ? (
                        <AssetGrid assets={videoAssets} />
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No videos match your search.</p>
                    )}
                </div>
            ) : (
                 <div className="text-center py-10">
                    <VideoIcon className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">Upload your first video</p>
                </div>
            )}
        </div>
    );
};


const RecordingTimer: React.FC = () => {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60).toString().padStart(2, '0');
        const secondsFormatted = (time % 60).toString().padStart(2, '0');
        return `${minutes}:${secondsFormatted}`;
    }

    return <span className="font-mono">{formatTime(seconds)}</span>
}

const AudioPanel: React.FC<{ onFilesSelected: (files: FileList) => void }> = ({ onFilesSelected }) => {
    const { state, dispatch } = useEditor();
    const { playback } = state;
    const { isRecording, stream, startRecording, stopRecording } = useAudioRecorder(dispatch);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [filterQuery, setFilterQuery] = useState('');
    const [sortOption, setSortOption] = useState('date-desc');

    const audioAssets = useMemo(() => {
        const assets = state.projectAssets.filter(a => a.type === 'audio');
        const filtered = assets.filter(asset => asset.name.toLowerCase().includes(filterQuery.toLowerCase()));
        const sorted = [...filtered];

        switch (sortOption) {
            case 'name-asc': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'name-desc': sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
            case 'date-desc': sorted.sort((a, b) => b.createdAt - a.createdAt); break;
            case 'date-asc': sorted.sort((a, b) => a.createdAt - b.createdAt); break;
            case 'duration-desc': sorted.sort((a, b) => ((b as AudioAsset).duration || 0) - ((a as AudioAsset).duration || 0)); break;
            case 'duration-asc': sorted.sort((a, b) => ((a as AudioAsset).duration || 0) - ((b as AudioAsset).duration || 0)); break;
        }
        return sorted;
    }, [state.projectAssets, filterQuery, sortOption]);

    const hasAnyAudioAssets = state.projectAssets.some(a => a.type === 'audio');

    const sortOptions = [
        { value: 'date-desc', label: 'Newest' },
        { value: 'date-asc', label: 'Oldest' },
        { value: 'name-asc', label: 'Name (A-Z)' },
        { value: 'name-desc', label: 'Name (Z-A)' },
        { value: 'duration-desc', label: 'Longest' },
        { value: 'duration-asc', label: 'Shortest' },
    ];

    return (
        <div className="p-4 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Audio</h2>

            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => isRecording ? stopRecording() : startRecording(playback.currentTime)}
                    className={`flex items-center justify-center gap-2 w-full px-4 py-3 text-white font-semibold rounded-lg transition-colors ${
                        isRecording 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    <MicrophoneIcon />
                    <span>{isRecording ? 'Stop' : 'Record'}</span>
                </button>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                    <UploadIcon />
                    <span>Upload</span>
                </button>
                <input
                    type="file"
                    accept="audio/*"
                    ref={fileInputRef}
                    multiple
                    onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
                    className="hidden"
                />
            </div>

            {isRecording && (
                <div className="mt-4 flex flex-col items-center justify-center gap-2 text-red-500">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <RecordingTimer />
                    </div>
                    {stream && <div className="w-full mt-2"><LiveWaveform stream={stream} /></div>}
                </div>
            )}
            
            {hasAnyAudioAssets ? (
                <div className="mt-6 flex-grow overflow-y-auto">
                     <AssetToolbar 
                        filterQuery={filterQuery}
                        onFilterChange={setFilterQuery}
                        sortOption={sortOption}
                        onSortChange={setSortOption}
                        sortOptions={sortOptions}
                    />
                    <AssetHeader title="My Audio" />
                     {audioAssets.length > 0 ? (
                        <AssetGrid assets={audioAssets} />
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No audio files match your search.</p>
                    )}
                </div>
            ) : (
                <div className="text-center py-10 flex-grow flex flex-col justify-center">
                    <AudioIcon className="w-12 h-12 mx-auto text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">Upload or record audio</p>
                </div>
            )}
        </div>
    );
};

const PlaceholderPanel: React.FC<{ title: string }> = ({ title }) => (
    <div className="p-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">{title}</h2>
        <p className="text-gray-500">Content and controls for {title} will be displayed here.</p>
    </div>
);

const ImagePanel: React.FC<{ onFilesSelected: (files: FileList) => void }> = ({ onFilesSelected }) => {
    const { state, dispatch } = useEditor();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [filterQuery, setFilterQuery] = useState('');
    const [sortOption, setSortOption] = useState('date-desc');
    const [generationPrompt, setGenerationPrompt] = useState('A photorealistic image of a cat wearing a wizard hat');
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    const handleGenerateImage = async () => {
        if (!generationPrompt.trim()) return;
        setIsGeneratingImage(true);
        setGenerationError(null);
        try {
            await generateImageAndAddToAssets(generationPrompt, dispatch);
        } catch (e: any) {
            setGenerationError(e.message || 'Failed to generate image.');
        } finally {
            setIsGeneratingImage(false);
        }
    }

    const imageAssets = useMemo(() => {
        const assets = state.projectAssets.filter(a => a.type === 'image');
        const filtered = assets.filter(asset => asset.name.toLowerCase().includes(filterQuery.toLowerCase()));
        const sorted = [...filtered];

        switch (sortOption) {
            case 'name-asc': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
            case 'name-desc': sorted.sort((a, b) => b.name.localeCompare(a.name)); break;
            case 'date-desc': sorted.sort((a, b) => b.createdAt - a.createdAt); break;
            case 'date-asc': sorted.sort((a, b) => a.createdAt - b.createdAt); break;
        }
        return sorted;
    }, [state.projectAssets, filterQuery, sortOption]);
    
    const hasAnyImageAssets = state.projectAssets.some(a => a.type === 'image');

     const sortOptions = [
        { value: 'date-desc', label: 'Newest' },
        { value: 'date-asc', label: 'Oldest' },
        { value: 'name-asc', label: 'Name (A-Z)' },
        { value: 'name-desc', label: 'Name (Z-A)' },
    ];
    
    return (
    <div className="p-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Image</h2>
        <div className="p-4 border border-gray-200 rounded-lg space-y-3 mb-4">
            <h3 className="font-semibold text-gray-800">Generate with AI</h3>
            <textarea
                value={generationPrompt}
                onChange={e => setGenerationPrompt(e.target.value)}
                placeholder="Enter a prompt..."
                rows={2}
                className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg"
                disabled={isGeneratingImage}
            />
            {generationError && <p className="text-sm text-red-500">{generationError}</p>}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !generationPrompt.trim()}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
                >
                    {isGeneratingImage ? <Spinner size="sm" /> : <GenerateIcon />}
                    <span>{isGeneratingImage ? 'Generating...' : 'Generate'}</span>
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                    <UploadIcon />
                    <span>Upload</span>
                </button>
            </div>
             <input
                type="file"
                ref={fileInputRef}
                multiple
                accept="image/jpeg,image/png,image/tiff,image/webp,image/svg+xml,image/vnd.adobe.photoshop,.psb"
                onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
                className="hidden"
            />
        </div>
         {hasAnyImageAssets ? (
            <div className="mt-6">
                 <AssetToolbar 
                    filterQuery={filterQuery}
                    onFilterChange={setFilterQuery}
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                    sortOptions={sortOptions}
                />
                <AssetHeader title="My Images" />
                {imageAssets.length > 0 ? (
                    <AssetGrid assets={imageAssets} />
                ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No images match your search.</p>
                )}
            </div>
        ) : (
             <div className="text-center py-10">
                <ImageIcon className="w-12 h-12 mx-auto text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">Upload or generate an image</p>
            </div>
        )}
    </div>
    );
};

const SubtitlesPanel: React.FC<{}> = () => {
    const { state } = useEditor();
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [error, setError] = useState<string|null>(null);
    const [transcribedText, setTranscribedText] = useState<string|null>(null);
    const [selectedAssetId, setSelectedAssetId] = useState<string|null>(null);

    const mediaAssets = useMemo(() => state.projectAssets.filter(a => a.type === 'video' || a.type === 'audio'), [state.projectAssets]);

    const handleTranscribe = async () => {
        if (!selectedAssetId) return;
        const asset = mediaAssets.find(a => a.id === selectedAssetId);
        if (!asset) return;

        setIsTranscribing(true);
        setError(null);
        setTranscribedText(null);
        try {
            const text = await generateSubtitlesFromAudio(asset);
            setTranscribedText(text);
        } catch(e: any) {
            setError(e.message || "Failed to transcribe audio.");
        } finally {
            setIsTranscribing(false);
        }
    }

    return (
    <div className="p-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Subtitles</h2>
        <div className="space-y-3">
            <div className="w-full text-left p-3 bg-gray-100 rounded-lg">
                <h3 className="font-semibold text-gray-800">Auto Subtitles</h3>
                <p className="text-sm text-gray-500 mb-3">Automatically transcribe audio to text.</p>
                {mediaAssets.length > 0 ? (
                    <div className="space-y-2">
                        <select
                            value={selectedAssetId || ''}
                            onChange={e => setSelectedAssetId(e.target.value)}
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg"
                        >
                            <option value="" disabled>Select a media file...</option>
                            {mediaAssets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <button
                            onClick={handleTranscribe}
                            disabled={!selectedAssetId || isTranscribing}
                            className="w-full p-2 bg-indigo-600 text-white rounded-lg disabled:bg-gray-400"
                        >
                            {isTranscribing ? 'Transcribing...' : 'Generate Subtitles'}
                        </button>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">Upload a video or audio file to enable transcription.</p>
                )}
                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
                {transcribedText && (
                    <div className="mt-3 p-2 bg-white border rounded-md">
                         <h4 className="font-semibold text-sm mb-1">Result:</h4>
                         <p className="text-xs text-gray-700 max-h-24 overflow-y-auto">{transcribedText}</p>
                    </div>
                )}
            </div>
            <button className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <h3 className="font-semibold text-gray-800">Manual Subtitles</h3>
                <p className="text-sm text-gray-500">Add and edit your own subtitles.</p>
            </button>
        </div>
    </div>
    );
};

const ColorPicker: React.FC<{
    label: string;
    selectedColor: string;
    onColorChange: (color: string) => void;
    includeTransparent?: boolean;
}> = ({ label, selectedColor, onColorChange, includeTransparent = false }) => {
    const colorPickerRef = useRef<HTMLInputElement>(null);

    const handleSwatchClick = (color: string) => {
        onColorChange(color);
    };

    const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onColorChange(e.target.value);
    };

    const triggerColorPicker = () => {
        colorPickerRef.current?.click();
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <div className="flex flex-wrap items-center gap-2">
                {includeTransparent && (
                    <button
                        type="button"
                        onClick={() => handleSwatchClick(TRANSPARENT_COLOR)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === TRANSPARENT_COLOR ? 'border-indigo-500' : 'border-gray-300'}`}
                        style={{
                            background: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none'/%3e%3cpath d='M0 0 L100 100' stroke='%23EF4444' stroke-width='3'/%3e%3c/svg%3e"), linear-gradient(to top right, #fff, #fff)`
                        }}
                        aria-label="Transparent color"
                    />
                )}
                {PRESET_COLORS.map(color => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => handleSwatchClick(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === color ? 'border-indigo-500' : 'border-white/50'}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Color ${color}`}
                    />
                ))}
                <div className="relative">
                    <button
                        type="button"
                        onClick={triggerColorPicker}
                        className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center"
                        style={{
                            background: `conic-gradient(from 90deg, violet, indigo, blue, green, yellow, orange, red, violet)`
                        }}
                        aria-label="Custom color picker"
                    >
                         <PlusIcon className="w-4 h-4 text-white mix-blend-difference" />
                    </button>
                    <input
                        ref={colorPickerRef}
                        type="color"
                        value={selectedColor === TRANSPARENT_COLOR ? '#ffffff' : selectedColor}
                        onChange={handlePickerChange}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
};

const TextPanel: React.FC<{}> = () => {
    const { state, dispatch } = useEditor();
    const [textInput, setTextInput] = useState("Your Text Here");
    const [style, setStyle] = useState<TextStyle>({
        fontFamily: FONT_FAMILIES[0].value,
        fontSize: 48,
        color: '#FFFFFF',
        backgroundColor: 'transparent',
    });

    const handleStyleChange = <K extends keyof TextStyle>(key: K, value: TextStyle[K]) => {
        setStyle(prev => ({ ...prev, [key]: value }));
    };
    
    const handleAddText = () => {
        addTextClip(dispatch, textInput, style, state.playback.currentTime);
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Text</h2>
            <div className="space-y-3">
                <button
                    onClick={handleAddText}
                    className="w-full flex items-center justify-center gap-3 p-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    <TextIcon className="w-6 h-6 flex-shrink-0" />
                    <span className="text-lg">Add Text to Timeline</span>
                </button>
            </div>

            <div className="mt-6 space-y-4">
                <div className="p-4 rounded-lg bg-gray-200 flex items-center justify-center min-h-[100px]" style={{ backgroundColor: style.backgroundColor === TRANSPARENT_COLOR ? '#e5e7eb' : style.backgroundColor }}>
                    <p 
                        className="text-center break-words"
                        style={{
                            fontFamily: style.fontFamily,
                            fontSize: `${style.fontSize}px`,
                            color: style.color,
                            textShadow: style.backgroundColor === TRANSPARENT_COLOR && style.color === '#FFFFFF' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                        }}
                    >
                        {textInput || "Preview"}
                    </p>
                </div>
                
                <div>
                    <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                        id="text-input"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        rows={3}
                        className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-800"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="font-family" className="block text-sm font-medium text-gray-700 mb-1">Font</label>
                        <select
                            id="font-family"
                            value={style.fontFamily}
                            onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                            className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-800 appearance-none bg-no-repeat bg-right pr-8" style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em'}}
                        >
                            {FONT_FAMILIES.map(font => (
                                <option key={font.name} value={font.value} style={{fontFamily: font.value}}>{font.name}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="font-size" className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                        <input
                            id="font-size"
                            type="number"
                            min="1"
                            value={style.fontSize}
                            onChange={(e) => handleStyleChange('fontSize', parseInt(e.target.value, 10) || 0)}
                            className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-gray-800"
                        />
                    </div>
                </div>

                <ColorPicker
                    label="Text Color"
                    selectedColor={style.color}
                    onColorChange={(c) => handleStyleChange('color', c)}
                />

                <ColorPicker
                    label="Background"
                    selectedColor={style.backgroundColor}
                    onColorChange={(c) => handleStyleChange('backgroundColor', c)}
                    includeTransparent
                />
            </div>
        </div>
    );
};

const ElementsPanel: React.FC<{}> = () => {
    return (
    <div className="p-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Elements</h2>
        <div className="grid grid-cols-4 gap-3 text-center">
            {SHAPE_ELEMENTS.map(shape => (
                 <div
                    key={shape.id}
                    draggable="true"
                    onDragStart={(e) => {
                        // Note: Element assets are not in projectAssets, so we pass the whole object
                        e.dataTransfer.setData(DND_TYPES.ASSET, JSON.stringify({ assetId: shape.id, type: 'element', duration: 5 }));
                        e.dataTransfer.effectAllowed = 'copy';
                    }}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 cursor-grab active:cursor-grabbing transition-colors"
                >
                    {shape.src === 'square' && <SquareIcon className="w-10 h-10 text-gray-600" />}
                    {shape.src === 'circle' && <CircleIcon className="w-10 h-10 text-gray-600" />}
                    {shape.src === 'triangle' && <TriangleIcon className="w-10 h-10 text-gray-600" />}
                    {shape.src === 'star' && <StarIcon className="w-10 h-10 text-gray-600" />}
                    <span className="text-xs text-gray-500">{shape.name}</span>
                </div>
            ))}
        </div>
        <div className="mt-6">
            <AssetHeader title="Stickers" />
             <div className="grid grid-cols-3 gap-2">
                <img src="https://picsum.photos/seed/sticker1/100/100" alt="Sticker 1" className="rounded-lg aspect-square object-cover" />
                <img src="https://picsum.photos/seed/sticker2/100/100" alt="Sticker 2" className="rounded-lg aspect-square object-cover" />
                <img src="https://picsum.photos/seed/sticker3/100/100" alt="Sticker 3" className="rounded-lg aspect-square object-cover" />
            </div>
        </div>
    </div>
    )
};

const BrandKitPanel: React.FC<{}> = () => {
    const { brandKit, isLoading, addLogo } = useBrandKit();
    const { state, dispatch } = useEditor();

    if (isLoading) {
        return <div className="p-4 text-gray-500">Loading Brand Kit...</div>
    }

    if (!brandKit) {
        return <div className="p-4 text-gray-500">Could not load Brand Kit.</div>
    }

    const handleLogoUpload = (file: File) => {
        addLogo(file);
    };
    
    const handleAddLogoToTimeline = async (logo: {id: string; url: string; name: string}) => {
        // A bit of a hack: create a fake file to run through the existing asset pipeline
        const response = await fetch(logo.url);
        const blob = await response.blob();
        const file = new File([blob], logo.name, { type: blob.type });
        await addAssetFromFile(dispatch, file);
        const addedAsset = (dispatch as any).getState().projectAssets.find((a: any) => a.url === logo.url);

        if (addedAsset) {
            const newClipData: Omit<VideoClip, 'id'|'trackId'> = {
                assetId: addedAsset.id, 
                type: 'video', 
                start: state.playback.currentTime, 
                duration: 5,
                volume: 1,
                speed: 1,
                transform: { scale: 0.25, rotation: 0, position: { x: 40, y: -40 } }, // Top right corner
                crop: { top: 0, right: 0, bottom: 0, left: 0 },
                filter: null,
            };
            addClip(dispatch, newClipData);
        }
    }


    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Brand Kit</h2>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Logos</h3>
                    <div className="grid grid-cols-3 gap-3">
                        {brandKit.logos.map(logo => (
                            <button key={logo.id} onClick={() => handleAddLogoToTimeline(logo)} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:ring-2 ring-indigo-500 p-2">
                                <img src={logo.url} alt={logo.name} className="max-w-full max-h-full object-contain" />
                            </button>
                        ))}
                        <LogoUploader onUpload={handleLogoUpload} />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Colors</h3>
                    <div className="flex gap-2 items-center flex-wrap">
                        {brandKit.colors.map(color => (
                            <button key={color.id} className="w-10 h-10 rounded-full cursor-pointer border-2 border-transparent hover:border-gray-800" style={{backgroundColor: color.hex}} title={color.name}></button>
                        ))}
                         <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:border-gray-800">
                            <PlusIcon className="w-6 h-6 text-gray-400"/>
                        </button>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Fonts</h3>
                    <div className="space-y-2">
                        {brandKit.fonts.map(font => (
                            <button key={font.id} className="w-full text-left p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                                <p className="text-gray-800" style={{fontFamily: font.fontFamily}}>{font.type}: {font.name}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
};

const SettingsPanel: React.FC<{}> = () => {
    const { settings, setSettings } = useSettings();

    if (!settings) return null;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Settings</h2>
            <SettingsForm settings={settings} onSettingsChange={setSettings} />
        </div>
    )
};

const LoadingAsset: React.FC<{ name: string }> = ({ name }) => (
    <div className="relative rounded-lg overflow-hidden group bg-gray-200 animate-pulse aspect-video">
        <div className="w-full h-full flex items-center justify-center">
            <Spinner size="sm" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
            <p className="text-xs font-semibold truncate">{name}</p>
        </div>
    </div>
);


const AssetPanel: React.FC<AssetPanelProps> = (props) => {
    const { activeItem } = props;
    const { state, dispatch } = useEditor();
    const { projectAssets } = state;
    const [processingFiles, setProcessingFiles] = useState<string[]>([]);

    useEffect(() => {
        if (processingFiles.length > 0) {
            const processedNames = new Set(projectAssets.map(a => a.name));
            setProcessingFiles(prev => prev.filter(name => !processedNames.has(name)));
        }
    }, [projectAssets, processingFiles]);

    const handleFilesSelected = (files: FileList) => {
        setProcessingFiles(prev => [...prev, ...Array.from(files).map(f => f.name)]);
        for (const file of Array.from(files)) {
            addAssetFromFile(dispatch, file);
        }
    };
    
    const processingPlaceholders = (
        processingFiles.length > 0 && 
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Uploading...</h3>
                <div className="grid grid-cols-2 gap-2">
                    {processingFiles.map(name => <LoadingAsset key={name} name={name} />)}
                </div>
            </div>
    );

  const renderContent = () => {
    switch(activeItem) {
        case 'AI Agent':
            return <AIAgentPanel
                        prompt={props.prompt}
                        setPrompt={props.setPrompt}
                        isGenerating={props.isGenerating}
                        onGenerate={props.onGenerate}
                        onCancel={props.onCancel}
                    />;
        case 'Video':
            return <>
                {processingPlaceholders}
                <VideoPanel onFilesSelected={handleFilesSelected} />
            </>;
        case 'Audio':
             return <>
                {processingPlaceholders}
                <AudioPanel onFilesSelected={handleFilesSelected} />
            </>;
        case 'Image':
             return <>
                {processingPlaceholders}
                <ImagePanel onFilesSelected={handleFilesSelected} />
            </>;
        case 'Subtitles':
            return <SubtitlesPanel />;
        case 'Text':
            return <TextPanel />;
        case 'Elements':
            return <ElementsPanel />;
        case 'Brand Kit':
            return <BrandKitPanel />;
        case 'Settings':
            return <SettingsPanel />;
        default:
            return <PlaceholderPanel title={activeItem} />;
    }
  }

  return (
    <aside className="w-full h-full bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="flex-grow overflow-y-auto">
            {renderContent()}
        </div>
    </aside>
  );
};

export default AssetPanel;
