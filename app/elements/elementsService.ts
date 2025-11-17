import { STICKER_ELEMENTS } from '../../data/elements/constants';
import type { ElementAsset } from '../../lib/elements/types';

// Placeholder for fetching elements from a remote source

export const fetchStickers = async (query: string): Promise<ElementAsset[]> => {
  console.log(`Fetching stickers for query: ${query}`);
  // Simulate an API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return STICKER_ELEMENTS.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
};
