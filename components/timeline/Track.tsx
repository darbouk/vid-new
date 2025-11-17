import React from 'react';
import { TimelineTrack as TrackType } from '../../lib/timeline';
import { useEditor } from '../../hooks/useEditor';
import { Clip } from './Clip';
import { AudioClip as AudioClipComponent } from '../audio/AudioClip';
import { VideoClip as VideoClipComponent } from '../video/VideoClip';
import { TextClip as TextClipComponent } from '../text/TextClip';
import { ElementClip as ElementClipComponent } from '../elements/ElementClip';
import { handleDrop } from '../../app/actions/timelineActions';

interface TrackProps {
  track: TrackType;
  index: number;
  onContextMenu: (event: React.MouseEvent, data: any) => void;
}

export const Track: React.FC<TrackProps> = ({ track, index, onContextMenu }) => {
  const { state, dispatch } = useEditor();
  const [isDragOver, setIsDragOver] = React.useState(false);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent drop from bubbling to parent
    setIsDragOver(false);
    handleDrop(e, state, dispatch, track.id);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragOver(false);
  };
  
  return (
    <div
      className={`h-12 relative mt-2 border-y border-gray-700/50 ${isDragOver ? 'bg-indigo-900/30' : 'bg-gray-800'}`}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      {track.clips.map(clipId => {
        const clipData = state.timeline.clips[clipId];
        if (!clipData) return null;
        
        return (
          <Clip key={clipId} clip={clipData} onContextMenu={onContextMenu}>
            {clipData.type === 'audio' && <AudioClipComponent clip={clipData} />}
            {clipData.type === 'video' && <VideoClipComponent clip={clipData} />}
            {clipData.type === 'text' && <TextClipComponent clip={clipData} />}
            {clipData.type === 'element' && <ElementClipComponent clip={clipData} />}
          </Clip>
        );
      })}
    </div>
  );
};
