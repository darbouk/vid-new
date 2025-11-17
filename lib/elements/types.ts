export type ElementType = 'shape' | 'sticker' | 'emoji';

export interface ElementAsset {
  id: string;
  type: ElementType;
  src: string; // URL for stickers, or a descriptor like 'square' for shapes
  name: string;
}

export interface ElementClip {
  id: string;
  assetId: string;
  startTime: number;
  duration: number;
  track: number;
  // Position and size properties would go here
  x: number;
  y: number;
  width: number;
  height: number;
}
