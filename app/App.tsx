import React, { useState, useRef, useMemo } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import AssetPanel from '../components/AssetPanel';
import VideoPreview from '../components/VideoPreview';
import Timeline from '../components/Timeline';
import ExportModal from '../components/ExportModal';
import { FXPanel } from '../components/fx';
import type { AspectRatio, SidebarItemType, Resolution } from '../lib/types';
import type { AppliedFX } from '../lib/fx';
import { generateVideo } from './api/geminiService';
import { EditorProvider, EditorContext } from './store/EditorProvider';
import { InspectorPanel } from '../components/panels';
import { Asset } from '../lib/assets';
import { generateId, getMediaDuration } from '../lib/utils';
import { useFileDrop } from '../hooks/useFileDrop';
import { useContextMenu } from '../hooks/useContextMenu';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { FileDropZone } from '../components/FileDropZone';
import { ContextMenu, ContextMenuItem } from '../components/ContextMenu';
import { DeleteIcon, ScissorsIcon, DuplicateIcon, UploadIcon } from '../components/icons/Icons';
import { 
    deleteClip, selectAllClips, clearSelection, 
    splitSelectedClip, duplicateSelectedClips, deleteSelectedClips, updateClip 
} from './actions/timelineActions';
import { addAssetFromFile } from './actions/assetActions';
import { usePlayback } from '../hooks/usePlayback';
import { useAudioEngine } from '../hooks/useAudioEngine';
import type { AnyClip } from '../lib/timeline';

const AppContent: React.FC = () => {
  const { state, dispatch, undo, redo } = React.useContext(EditorContext);
  const { togglePlay } = usePlayback();
  useAudioEngine(); // This hook will react to state changes and play audio

  const [activeSidebarItem, setActiveSidebarItem] = useState<SidebarItemType>('Video');
  const [prompt, setPrompt] = useState<string>('A neon hologram of a cat driving at top speed');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [resolution, setResolution] = useState<Resolution>('720p');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isFXPanelOpen, setIsFXPanelOpen] = useState<boolean>(false);
  const [fxPanelAnchor, setFxPanelAnchor] = useState<HTMLButtonElement | null>(null);

  const copiedPropertiesRef = useRef<Partial<AnyClip> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { isDragOver } = useFileDrop((files) => {
    for (const file of Array.from(files)) {
        addAssetFromFile(dispatch, file);
    }
  });

  const { anchorPoint, isOpen: isContextMenuOpen, contextData, handleContextMenu, closeContextMenu } = useContextMenu();

  const hasTimelineContent = state.timeline.tracks.some(t => t.clips.length > 0);

  const handleDeleteClip = () => {
    if (contextData?.clipId) {
        deleteClip(dispatch, contextData.clipId);
    } else {
        handleDeleteSelected();
    }
  };

  const handleDeleteSelected = () => {
      deleteSelectedClips(dispatch, state.selection);
  }

  const handleSplitSelected = () => {
    splitSelectedClip(dispatch, state.selection, state.playback.currentTime);
  }

  const handleDuplicateSelected = () => {
    duplicateSelectedClips(dispatch, state.selection);
  }
  
  const handleCopyProperties = () => {
    if (state.selection.clips.length === 1) {
        const clip = state.timeline.clips[state.selection.clips[0]];
        if (clip) {
            const { id, assetId, start, duration, trackId, ...propertiesToCopy } = clip;
            copiedPropertiesRef.current = propertiesToCopy;
        }
    }
  };

  const handlePasteProperties = () => {
    if (copiedPropertiesRef.current && state.selection.clips.length > 0) {
        state.selection.clips.forEach(clipId => {
            const targetClip = state.timeline.clips[clipId];
            if (targetClip && targetClip.type === (copiedPropertiesRef.current as AnyClip).type) {
                updateClip(dispatch, clipId, copiedPropertiesRef.current);
            }
        });
    }
  };


  const shortcuts = useMemo(() => ({
    ' ': (e: KeyboardEvent) => {
      if (document.activeElement?.tagName !== 'BUTTON' && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        togglePlay();
      }
    },
    'z': (e: KeyboardEvent) => { if (e.metaKey || e.ctrlKey) { e.preventDefault(); e.shiftKey ? redo() : undo() } },
    'Backspace': (e: KeyboardEvent) => { 
        e.preventDefault();
        if(state.selection.clips.length > 0) {
            handleDeleteSelected();
        }
    },
    'Delete': (e: KeyboardEvent) => {
        e.preventDefault();
        if(state.selection.clips.length > 0) {
            handleDeleteSelected();
        }
    },
    'A': (e: KeyboardEvent) => {
        if (e.shiftKey) {
            e.preventDefault();
            selectAllClips(dispatch);
        }
    },
    'Escape': (e: KeyboardEvent) => {
        e.preventDefault();
        clearSelection(dispatch);
    },
    'c': (e: KeyboardEvent) => { if (e.metaKey || e.ctrlKey) { e.preventDefault(); handleCopyProperties(); } },
    'v': (e: KeyboardEvent) => { if (e.metaKey || e.ctrlKey) { e.preventDefault(); handlePasteProperties(); } },

  }), [togglePlay, undo, redo, dispatch, state.selection.clips]);

  useKeyboardShortcuts(shortcuts);

  const handleGenerateVideo = async () => {
    if (!prompt) {
      setError('Please enter a prompt to generate a video.');
      return;
    }
    setError(null);
    setIsGenerating(true);
    setGeneratedVideoUrl(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await generateVideo(
        prompt,
        aspectRatio,
        setLoadingMessage,
        async (url, blob) => {
          setGeneratedVideoUrl(url);
          setIsGenerating(false);
          abortControllerRef.current = null;
          
          const { duration, width, height } = await getMediaDuration(url);
          const newAsset: Asset = {
            id: generateId(),
            type: 'video',
            name: prompt.substring(0, 30),
            url,
            duration,
            width: width || (resolution === '1080p' ? 1920 : 1280),
            height: height || (resolution === '1080p' ? 1080 : 720),
            createdAt: Date.now(),
          };
          dispatch({ type: 'ADD_ASSET', payload: newAsset });
        },
        (err) => {
          setError(err);
          setIsGenerating(false);
          abortControllerRef.current = null;
        },
        () => setApiKeySelected(true),
        resolution,
        controller.signal
      );
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setIsGenerating(false);
        setLoadingMessage('');
        setError(null);
    }
  };

  const handleExportVideo = () => {
    setIsExportModalOpen(true);
  };

  const handleConfirmExport = (filename: string, format: string) => {
    // This is where a real export would happen using the canvas content.
    // For now, we download the generated video if it exists.
    if (generatedVideoUrl) {
      const link = document.createElement('a');
      link.href = generatedVideoUrl;
      const finalFilename = filename.endsWith(`.${format.toLowerCase()}`) ? filename : `${filename}.${format.toLowerCase()}`;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    console.log(`Exporting timeline as ${filename}.${format.toLowerCase()}`);
    setIsExportModalOpen(false);
  }
  
  const handleFXClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFxPanelAnchor(event.currentTarget);
    setIsFXPanelOpen(prev => !prev);
  };

  const handleApplyFX = (fx: AppliedFX) => {
    console.log('Applying FX to timeline:', fx);
    setIsFXPanelOpen(false);
  };

  const assetPanelProps = {
    activeItem: activeSidebarItem,
    prompt, setPrompt, isGenerating,
    onGenerate: handleGenerateVideo,
    onCancel: handleCancelGeneration,
  };
  
  const contextMenuItems = [];
  if (contextData?.clipId || state.selection.clips.length > 0) {
    if (state.selection.clips.length === 1) {
        contextMenuItems.push(<ContextMenuItem key="split" onClick={handleSplitSelected}><ScissorsIcon className="w-4 h-4" /> Split</ContextMenuItem>);
        contextMenuItems.push(<ContextMenuItem key="copy" onClick={handleCopyProperties}><DuplicateIcon className="w-4 h-4" /> Copy Properties</ContextMenuItem>);
    }
    if (copiedPropertiesRef.current) {
         contextMenuItems.push(<ContextMenuItem key="paste" onClick={handlePasteProperties}><UploadIcon className="w-4 h-4" /> Paste Properties</ContextMenuItem>);
    }
    contextMenuItems.push(<ContextMenuItem key="duplicate" onClick={handleDuplicateSelected}><DuplicateIcon className="w-4 h-4" /> Duplicate</ContextMenuItem>);
    contextMenuItems.push(<ContextMenuItem key="delete" onClick={handleDeleteClip} danger><DeleteIcon className="w-4 h-4" /> Delete</ContextMenuItem>);
  }

  return (
    <FileDropZone isDragOver={isDragOver}>
        <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden">
        <Header
            onExport={handleExportVideo}
            exportDisabled={!hasTimelineContent}
            onMenuClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
            onFXClick={handleFXClick}
            onSplit={handleSplitSelected}
            onDuplicate={handleDuplicateSelected}
            onDelete={handleDeleteSelected}
            selection={state.selection}
        />
        <div className="flex flex-grow overflow-hidden relative">
            <div className="hidden lg:flex flex-shrink-0">
            <Sidebar activeItem={activeSidebarItem} setActiveItem={setActiveSidebarItem} />
            <div className="w-80">
                <AssetPanel {...assetPanelProps} />
            </div>
            </div>
            
            <div
            className={`fixed lg:hidden top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out flex w-[calc(100%-3rem)] max-w-sm ${
                isMobilePanelOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            >
            <Sidebar activeItem={activeSidebarItem} setActiveItem={setActiveSidebarItem} />
            <div className="flex-1 min-w-0">
                <AssetPanel {...assetPanelProps} />
            </div>
            </div>
            {isMobilePanelOpen && (
            <div
                onClick={() => setIsMobilePanelOpen(false)}
                className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                aria-hidden="true"
            ></div>
            )}

            <main className="flex-grow flex flex-col bg-gray-200 min-w-0">
                <VideoPreview
                    videoUrl={generatedVideoUrl}
                    isGenerating={isGenerating}
                    loadingMessage={loadingMessage}
                    error={error}
                    aspectRatio={aspectRatio}
                    setAspectRatio={setAspectRatio}
                    resolution={resolution}
                    setResolution={setResolution}
                    onExport={handleExportVideo}
                />
                <Timeline onContextMenu={handleContextMenu} />
            </main>
            
            <div className="relative">
                <InspectorPanel />
            </div>
        </div>
        <ExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            onConfirmExport={handleConfirmExport}
            videoUrl={generatedVideoUrl}
        />
        <FXPanel
            isOpen={isFXPanelOpen}
            onClose={() => setIsFXPanelOpen(false)}
            onApply={handleApplyFX}
            anchorElement={fxPanelAnchor}
        />
        <ContextMenu isOpen={isContextMenuOpen} position={anchorPoint} onClose={closeContextMenu}>
            {contextMenuItems}
        </ContextMenu>
        </div>
    </FileDropZone>
  );
};

const App: React.FC = () => (
  <EditorProvider>
    <AppContent />
  </EditorProvider>
)

export default App;
