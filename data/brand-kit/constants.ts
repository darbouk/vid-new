import type { BrandKit } from '../../lib/brand-kit/types';

export const DEFAULT_BRAND_KIT: BrandKit = {
    logos: [
        { id: 'logo-1', name: 'Default Logo', url: 'https://picsum.photos/seed/logo1/100/100?grayscale' },
    ],
    colors: [
        { id: 'color-1', name: 'Primary', hex: '#3B82F6' }, // blue-500
        { id: 'color-2', name: 'Secondary', hex: '#10B981' }, // green-500
        { id: 'color-3', name: 'Accent', hex: '#F59E0B' }, // yellow-500
    ],
    fonts: [
        { id: 'font-1', name: 'Primary Font', fontFamily: 'Poppins, sans-serif', type: 'primary' },
        { id: 'font-2', name: 'Secondary Font', fontFamily: 'Lora, serif', type: 'secondary' },
    ]
};
