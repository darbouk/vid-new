export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const getMediaDuration = (url: string, type: 'audio' | 'video' = 'video'): Promise<{ duration: number; width: number; height: number; }> => {
    return new Promise((resolve, reject) => {
        const mediaElement = document.createElement(type);
        mediaElement.onloadedmetadata = () => {
            resolve({
                duration: mediaElement.duration,
                width: (mediaElement as HTMLVideoElement).videoWidth || 0,
                height: (mediaElement as HTMLVideoElement).videoHeight || 0,
            });
        };
        mediaElement.onerror = (e) => {
            console.warn(`Could not load metadata for ${url}`, e);
            reject(new Error(`Failed to load media metadata for ${url}`));
        }
        mediaElement.src = url;
    });
};