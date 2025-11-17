import type { ElementAsset } from '../../lib/elements/types';

export const SHAPE_ELEMENTS: ElementAsset[] = [
  { id: 'shape-square', type: 'shape', src: 'square', name: 'Square' },
  { id: 'shape-circle', type: 'shape', src: 'circle', name: 'Circle' },
  { id: 'shape-triangle', type: 'shape', src: 'triangle', name: 'Triangle' },
  { id: 'shape-star', type: 'shape', src: 'star', name: 'Star' },
];

export const STICKER_ELEMENTS: ElementAsset[] = [
    { id: 'sticker-1', type: 'sticker', src: 'https://picsum.photos/seed/sticker1/100/100', name: 'Cool Sticker' },
    { id: 'sticker-2', type: 'sticker', src: 'https://picsum.photos/seed/sticker2/100/100', name: 'Fun Sticker' },
    { id: 'sticker-3', type: 'sticker', src: 'https://picsum.photos/seed/sticker3/100/100', name: 'Awesome Sticker' },
];
