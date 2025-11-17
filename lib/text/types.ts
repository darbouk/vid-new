export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
}

export interface TextClip {
  id: string;
  text: string;
  style: TextStyle;
  startTime: number;
  duration: number;
  track: number;
}
