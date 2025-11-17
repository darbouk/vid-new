import { useState, useCallback, useEffect } from 'react';
import type { BrandKit, BrandLogo } from '../../lib/brand-kit/types';
import { fetchBrandKit, saveBrandKit } from '../../app/brand-kit/brandKitService';
import { DEFAULT_BRAND_KIT } from '../../data/brand-kit/constants';

export const useBrandKit = () => {
    const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBrandKit()
            .then(setBrandKit)
            .catch(() => setBrandKit(DEFAULT_BRAND_KIT)) // fallback to default
            .finally(() => setIsLoading(false));
    }, []);
    
    const addLogo = useCallback(async (file: File) => {
        if (!brandKit) return;
        // In a real app, you would upload the file and get a URL back.
        const newLogo: BrandLogo = {
            id: `logo-${Date.now()}`,
            name: file.name,
            url: URL.createObjectURL(file),
        };
        const updatedKit = { ...brandKit, logos: [...brandKit.logos, newLogo] };
        setBrandKit(updatedKit);
        await saveBrandKit(updatedKit);
    }, [brandKit]);

    return { brandKit, isLoading, addLogo };
};
