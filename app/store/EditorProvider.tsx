import React, { createContext, Dispatch, useMemo } from 'react';
import { EditorState } from '../../lib/editor';
import { AnyClip, TimelineState, TimelineTrack } from '../../lib/timeline';
import { generateId } from '../../lib/utils';
import { useHistory } from '../../hooks/useHistory';

export type Action =
  | { type: 'ADD_ASSET'; payload: any }
  | { type: 'ADD_CLIP'; payload: { newClip: Partial<AnyClip>, track?: TimelineTrack } }
  | { type: 'UPDATE_CLIP'; payload: any, meta?: { skipHistory: boolean } }
  | { type: 'DELETE_CLIP'; payload: { clipId: string } }
  | { type: 'SPLIT_CLIP', payload: { clipId: string, splitTime: number } }
  | { type: 'DUPLICATE_CLIPS', payload: { clipIds: string[] } }
  | { type: 'SET_CURRENT_TIME'; payload: number, meta?: { skipHistory: boolean } }
  | { type: 'SET_IS_PLAYING'; payload: boolean, meta?: { skipHistory: boolean } }
  | { type: 'SET_VOLUME'; payload: number, meta?: { skipHistory: boolean } }
  | { type: 'SET_IS_MUTED'; payload: boolean, meta?: { skipHistory: boolean } }
  | { type: 'SET_SELECTION'; payload: string[] }
  | { type: 'SELECT_ALL_CLIPS' }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_PIXELS_PER_SECOND'; payload: number; meta?: { skipHistory: boolean } }
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'UNDO' }
  | { type: 'REDO' };


const initialTimelineState: TimelineState = {
    tracks: [
        { id: generateId(), type: 'video', clips: [] },
        { id: generateId(), type: 'audio', clips: [] },
    ],
    clips: {},
    duration: 60,
    pixelsPerSecond: 50,
};

const initialState: EditorState = {
    projectAssets: [],
    timeline: initialTimelineState,
    playback: {
        isPlaying: false,
        currentTime: 0,
        volume: 1,
        isMuted: false,
    },
    selection: {
        clips: [],
    },
    isRecording: false,
};

const editorReducer = (state: EditorState, action: Action): EditorState => {
    switch (action.type) {
        case 'ADD_ASSET':
            if (action.payload.url && state.projectAssets.some(a => (a as any).url === action.payload.url)) {
                return state;
            }
            return {
                ...state,
                projectAssets: [...state.projectAssets, action.payload],
            };
        case 'ADD_CLIP': {
            const { newClip: partialClip, track: providedTrack } = action.payload;
            // Allow text/element clips on video tracks
            const allowedTrackTypes = (partialClip.type === 'text' || partialClip.type === 'element') ? ['video', 'text', 'element'] : [partialClip.type];
            const track = providedTrack || state.timeline.tracks.find(t => allowedTrackTypes.includes(t.type as string));

            if (!track) {
                console.error(`Could not find a suitable track for clip type ${partialClip.type}`);
                return state;
            }

            const finalClip = { ...partialClip, trackId: track.id } as AnyClip;
            
            if (!finalClip.id) {
                finalClip.id = generateId();
            }

            return {
                ...state,
                timeline: {
                    ...state.timeline,
                    clips: {
                        ...state.timeline.clips,
                        [finalClip.id]: finalClip,
                    },
                    tracks: state.timeline.tracks.map(t =>
                        t.id === track.id ? { ...t, clips: [...t.clips, finalClip.id] } : t
                    ),
                },
            };
        }
        case 'UPDATE_CLIP': {
             const { clipId, updates } = action.payload;
             const existingClip = state.timeline.clips[clipId];
             if (!existingClip) return state;
             const updatedClip = { ...existingClip, ...updates };
             return {
                ...state,
                timeline: {
                    ...state.timeline,
                    clips: {
                        ...state.timeline.clips,
                        [clipId]: updatedClip,
                    },
                },
             };
        }
        case 'DELETE_CLIP': {
            const { clipId } = action.payload;
            const clipToDelete = state.timeline.clips[clipId];
            if (!clipToDelete) return state;
            
            const newClips = { ...state.timeline.clips };
            delete newClips[clipId];

            return {
                ...state,
                timeline: {
                    ...state.timeline,
                    clips: newClips,
                    tracks: state.timeline.tracks.map(t => ({
                        ...t,
                        clips: t.clips.filter(id => id !== clipId),
                    })),
                },
                selection: {
                    ...state.selection,
                    clips: state.selection.clips.filter(id => id !== clipId),
                }
            }
        }
        case 'SPLIT_CLIP': {
            const { clipId, splitTime } = action.payload;
            const originalClip = state.timeline.clips[clipId];
            if (!originalClip || splitTime <= originalClip.start || splitTime >= originalClip.start + originalClip.duration) {
                return state;
            }

            const newClips = { ...state.timeline.clips };

            const clip1: AnyClip = {
                ...originalClip,
                id: generateId(),
                duration: splitTime - originalClip.start,
            };
            const clip2: AnyClip = {
                ...originalClip,
                id: generateId(),
                start: splitTime,
                duration: (originalClip.start + originalClip.duration) - splitTime,
            };
            
            delete newClips[originalClip.id];
            newClips[clip1.id] = clip1;
            newClips[clip2.id] = clip2;
            
            const newTracks = state.timeline.tracks.map(track => {
                if (track.id === originalClip.trackId) {
                    const clipIndex = track.clips.indexOf(clipId);
                    if (clipIndex > -1) {
                        const newTrackClips = [...track.clips];
                        newTrackClips.splice(clipIndex, 1, clip1.id, clip2.id);
                        return { ...track, clips: newTrackClips };
                    }
                }
                return track;
            });

            return {
                ...state,
                timeline: {
                    ...state.timeline,
                    clips: newClips,
                    tracks: newTracks,
                },
                selection: {
                    ...state.selection,
                    clips: [clip1.id, clip2.id]
                }
            };
        }
        case 'DUPLICATE_CLIPS': {
            const { clipIds } = action.payload;
            if (clipIds.length === 0) return state;

            const newClipsRecord: Record<string, AnyClip> = { ...state.timeline.clips };
            const newTrackClipsMap: Record<string, string[]> = {};
            const newSelection: string[] = [];

            const clipsToDuplicate = clipIds.map(id => state.timeline.clips[id]).filter(Boolean);

            const clipsByTrack: Record<string, AnyClip[]> = {};
            clipsToDuplicate.forEach(clip => {
                if (!clipsByTrack[clip.trackId]) clipsByTrack[clip.trackId] = [];
                clipsByTrack[clip.trackId].push(clip);
            });

            Object.values(clipsByTrack).forEach(trackClips => {
                const track = state.timeline.tracks.find(t => t.id === trackClips[0].trackId);
                if (!track) return;
                
                let placementTime = 0;
                track.clips.forEach(id => {
                    const c = state.timeline.clips[id];
                    if (c) placementTime = Math.max(placementTime, c.start + c.duration);
                });
                placementTime += 0.5; // Add a small gap

                trackClips.sort((a, b) => a.start - b.start);

                trackClips.forEach(originalClip => {
                    const newClip: AnyClip = {
                        ...originalClip,
                        id: generateId(),
                        start: placementTime,
                    };
                    newClipsRecord[newClip.id] = newClip;
                    
                    if (!newTrackClipsMap[originalClip.trackId]) newTrackClipsMap[originalClip.trackId] = [];
                    newTrackClipsMap[originalClip.trackId].push(newClip.id);
                    newSelection.push(newClip.id);

                    placementTime += originalClip.duration;
                });
            });

            const newTracks = state.timeline.tracks.map(track => {
                if (newTrackClipsMap[track.id]) {
                    return { ...track, clips: [...track.clips, ...newTrackClipsMap[track.id]] };
                }
                return track;
            });

            return {
                ...state,
                timeline: {
                    ...state.timeline,
                    clips: newClipsRecord,
                    tracks: newTracks,
                },
                selection: {
                    ...state.selection,
                    clips: newSelection,
                }
            };
        }
        case 'SET_CURRENT_TIME':
            return {
                ...state,
                playback: { ...state.playback, currentTime: action.payload },
            };
        case 'SET_IS_PLAYING':
            return {
                ...state,
                playback: { ...state.playback, isPlaying: action.payload },
            };
        case 'SET_VOLUME':
            return {
                ...state,
                playback: { ...state.playback, volume: action.payload },
            };
        case 'SET_IS_MUTED':
            return {
                ...state,
                playback: { ...state.playback, isMuted: action.payload },
            };
        case 'SET_SELECTION':
            return {
                ...state,
                selection: { ...state.selection, clips: action.payload },
            };
        case 'SELECT_ALL_CLIPS':
            return {
                ...state,
                selection: { ...state.selection, clips: Object.keys(state.timeline.clips) },
            };
        case 'CLEAR_SELECTION':
             return {
                ...state,
                selection: { ...state.selection, clips: [] },
            };
        case 'SET_PIXELS_PER_SECOND':
            return {
                ...state,
                timeline: { ...state.timeline, pixelsPerSecond: action.payload },
            };
        case 'START_RECORDING':
            return { ...state, isRecording: true };
        case 'STOP_RECORDING':
            return { ...state, isRecording: false };
        default:
            return state;
    }
};

export const EditorContext = createContext<{
  state: EditorState;
  dispatch: Dispatch<Action>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}>({
  state: initialState,
  dispatch: () => null,
  undo: () => {},
  redo: () => {},
  canUndo: false,
  canRedo: false,
});

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useHistory(editorReducer, initialState);
  
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    undo,
    redo,
    canUndo,
    canRedo,
  }), [state, dispatch, undo, redo, canUndo, canRedo]);
  
  // Add getState to dispatch for use in thunk-like actions
  (dispatch as any).getState = () => state;

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};