import React from 'react';
import { PlayIcon, PauseIcon } from '../icons/Icons';

interface AudioPlayerProps {
  src: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} preload="metadata" />
      <button onClick={togglePlay} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors">
        {isPlaying ? <PauseIcon className="w-4 h-4 text-gray-800" /> : <PlayIcon className="w-4 h-4 text-gray-800" />}
      </button>
      <div className="text-sm text-gray-600">Audio Preview</div>
    </div>
  );
};
