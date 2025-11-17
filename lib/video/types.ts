export interface VideoClip {
  id: string;
  src: string;
  thumbnail: string;
  duration: number; // in seconds
  startTime: number; // in timeline
  track: number;
}
